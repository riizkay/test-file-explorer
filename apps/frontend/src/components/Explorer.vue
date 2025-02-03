<script setup lang="ts">
import Tree from "primevue/tree";
import { Icon } from "@iconify/vue";
import { ref, onMounted } from "vue";
import Core, { URLSource } from "../common/core_client";
import { VTreeview } from "vuetify/labs/VTreeview";
import { defineComponent } from "vue";
import {
  type RestApiResponse,
  type FileSystemListResponse,
  type FileSystemItem,
  FSType,
} from "@shared/types";
import urlJoin from "url-join";
import ModalInputFolderName from "./modal/Modal.vue";
import { useToast } from "vue-toastification";
const toast = useToast();
type FileSystemItemPatched = FileSystemItem & {
  isOpen: boolean;
  selected: boolean;
  loading: boolean;
  children: FileSystemItemPatched[];
};
type FileSystemPatched = FileSystemListResponse & {
  path: string;
  items: FileSystemItemPatched[];
};
var navigateIndex = ref<number>(0);
const props = defineProps<{ path: string }>();
const currentPath = ref(props.path);
const openedFolders = ref<string[]>([]);
const selectedFolders = ref<string[]>([]);
const treeFS = ref<FileSystemPatched>();
const currentLS = ref<FileSystemListResponse>();
const currentLS_Page = ref<number>(1);
const currentLS_ItemPerPage = ref<number>(100);
const searchQuery = ref<string>("");
const fileInputRef = ref(null);
// Define tree data
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

const selectedItem = ref<FileSystemItem>();
const navStack = ref<string[]>([]);

const inputName = ref("");
const showModalInputName = ref<string | boolean>(false);

const handleContextMenu = (event: MouseEvent, file: FileSystemItem) => {
  event.preventDefault();
  showContextMenu.value = true;
  console.log(file, "file");
  selectFile(file);

  // Panggil adjustMenuPosition untuk mendapatkan posisi yang sudah disesuaikan
  const { x, y } = adjustMenuPosition(event.clientX, event.clientY);

  contextMenuPosition.value = { x, y };
  selectedItem.value = file;
};
const adjustMenuPosition = (x: number, y: number) => {
  const menu = document.querySelector(".context-menu");
  if (!menu) return { x, y };

  const menuRect = menu.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  return {
    x: Math.min(x, windowWidth - menuRect.width),
    y: Math.min(y, windowHeight - menuRect.height),
  };
};

const closeContextMenu = () => {
  showContextMenu.value = false;
};

const Load_FS_Main = async (path: string) => {
  return new Promise<FileSystemListResponse>((resolve, reject) => {
    Core.API.post<FileSystemListResponse>("/api/filesystem/list", {
      path: path,
      page: currentLS_Page.value,
      recursive: searchQuery.value.length > 0 ? true : false,
      search: searchQuery.value,
      limit: currentLS_ItemPerPage.value,
      type: [FSType.FILE, FSType.FOLDER],
    })
      .then((res: RestApiResponse<FileSystemListResponse>) => {
        if (res.success) {
          currentLS.value = res.data;
          currentPath.value = path;
          resolve(res.data);
          //console.log(currentLS.value, "wwwwwwww");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const refresh = () => {
  Load_FS_Main(currentPath.value);
};
const LoadFS_Sidebar = (path: string) => {
  return new Promise<FileSystemPatched>((resolve, reject) => {
    Core.API.post<FileSystemListResponse>("/api/filesystem/list", {
      path: path,
      page: 1,
      type: [2],
      limit: 100000,
    }).then((res: RestApiResponse<FileSystemListResponse>) => {
      if (res.success) {
        for (const item of res.data.items) {
          // (item as any).title = item.name;

          (item as any).path = path;
          (item as any).loading = false;
          (item as any).isOpen = false;
          if (item.childrenCount == 0) delete (item as any).children;
          else {
            (item as any).children = [];
          }
        }
        var patched = { ...res.data, path: path, items: res.data.items as FileSystemItemPatched[] };

        resolve(patched);
      } else {
        reject(res.message);
      }
    });
  });
};
const loadRootFS = () => {
  LoadFS_Sidebar("/").then((r: FileSystemPatched) => {
    treeFS.value = r;
  });
};

const selectFile = (file: FileSystemItem) => {
  selectedItem.value = file;
};
const navigateTo = (path?: string) => {
  var inputPath = path || currentPath.value;
  if (inputPath == "/") selectedFolders.value = [];

  if (navigateIndex.value < navStack.value.length - 1) {
    navStack.value.splice(navigateIndex.value + 1, navStack.value.length - navigateIndex.value - 1);
  }
  navStack.value.push(inputPath);
  navigateIndex.value = navStack.value.length - 1;
  Load_FS_Main(inputPath);
};
const openFile = (file: FileSystemItem) => {
  window.open(urlJoin(Core.Common.getURLSource(URLSource.file_delivery)!, file.cdn_url!), "_blank");
};

onMounted(async () => {
  await loadRootFS();
  navigateTo("/");

  document.addEventListener("click", (e: any) => {
    if (!e.target.closest(".context-menu")) {
      closeContextMenu();
    }
  });
});
const onNodeClick = (item: FileSystemItemPatched) => {
  const isOpen = !item.isOpen;
  item.isOpen = isOpen;

  const assignOpen = () => {
    const newOpenNodes = isOpen
      ? [...openedFolders.value, item.id]
      : openedFolders.value.filter((id) => id !== item.id);

    openedFolders.value = newOpenNodes;
  };
  if (item.isOpen == true) {
    if (item.children.length != item.childrenCount) {
      item.loading = true;

      LoadFS_Sidebar(urlJoin(item.path, item.name)).then((r: FileSystemPatched) => {
        item.children = r.items;
        console.log(item.children);
        item.loading = false;
        assignOpen();
      });
    } else {
      assignOpen();
    }
  } else {
    assignOpen();
  }
};
const selectFolder = (item: FileSystemItemPatched) => {
  selectedFolders.value = [item.id]; // Hanya memungkinkan satu pilihan
  var path = urlJoin(item.path, item.name);

  currentPath.value = path;
  navigateTo(path);
};
const modalActionInputName = (name: string) => {
  if (name.length == 0) {
    toast.error("Name cannot be empty");
    return;
  }

  if (showModalInputName.value == "create_folder") {
    Core.API.post("/api/filesystem/createFolder", {
      path: currentPath.value,
      name: name,
    }).then((res: RestApiResponse<any>) => {
      if (res.success) {
        toast.success("Folder created");

        showModalInputName.value = false;
        loadRootFS();
        Load_FS_Main(currentPath.value);
      } else {
        toast.error(res.message || "Failed to create folder");
      }
    });
  } else if (showModalInputName.value == "rename") {
    Core.API.post("/api/filesystem/rename", {
      id: selectedItem.value?.id,
      name: name,
    }).then((res: RestApiResponse<any>) => {
      if (res.success) {
        toast.success("Item has been renamed");
        showModalInputName.value = false;
        loadRootFS();
        Load_FS_Main(currentPath.value);
      } else {
        toast.error(res.message || "Failed to create folder");
      }
    });
  }
};

const goBack = () => {
  if (navigateIndex.value > 0) {
    navigateIndex.value--;
    Load_FS_Main(navStack.value[navigateIndex.value]);
  }
};
const goForward = () => {
  if (navigateIndex.value < navStack.value.length - 1) {
    navigateIndex.value++;
    Load_FS_Main(navStack.value[navigateIndex.value]);
  }
};

const deleteFile = (file: FileSystemItem) => {
  Core.API.post("/api/filesystem/delete", {
    id: file.id,
  }).then((res: RestApiResponse<any>) => {
    if (res.success) {
      toast.success("File deleted");
      loadRootFS();
      Load_FS_Main(currentPath.value);
    } else {
      toast.error(res.message || "Failed to delete file");
    }
  });
};
const uploadFile = () => {
  (fileInputRef.value as any).click();
};
const handleFileSelect = (event: any) => {
  const files = event.target.files;
  if (files.length > 0) {
    Core.CDN.upload_file(
      "/api/filesystem/uploadfile",
      files,
      { path: currentPath.value },
      (progress: number) => {
        console.log(progress);
      }
    ).then((res: any) => {
      if (res.success) {
        refresh();
      }
    });
    // Handle upload logic here
  }
};
const changePage = (page: number) => {
  currentLS_Page.value = page;
  refresh();
};
</script>

<template>
  <Teleport to="body">
    <ModalInputFolderName :show="showModalInputName !== false">
      <div class="w-[300px]">
        <h2 class="text-black">Please enter folder name</h2>

        <input
          type="text"
          v-model="inputName"
          @keyup.enter="modalActionInputName(inputName)"
          class="mb-3 mt-3 w-full px-4 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div class="flex justify-end gap-2">
          <v-btn
            class="bg-red-500 text-white px-4 py-1.5 rounded-lg"
            @click="
              () => {
                showContextMenu = false;
                showModalInputName = false;
                inputName = '';
              }
            "
          >
            Cancel
          </v-btn>
          <v-btn
            class="bg-blue-500 text-white px-4 py-1.5 rounded-lg"
            @click="modalActionInputName(inputName)"
          >
            Submit
          </v-btn>
        </div>
      </div>
    </ModalInputFolderName>
  </Teleport>

  <!-- Hidden file input -->
  <input type="file" ref="fileInputRef" @change="handleFileSelect" style="display: none" multiple />

  <div class="flex flex-col h-full relative">
    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="absolute bg-white shadow-lg rounded-lg py-2 z-50"
        :style="{
          left: `${contextMenuPosition.x}px`,
          top: `${contextMenuPosition.y}px`,
        }"
      >
        <div
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          @click="
            () => {
              showContextMenu = false;
              showModalInputName = 'create_folder';
            }
          "
        >
          New Folder
        </div>
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="uploadFile()">
          Upload File
        </div>
        <div
          v-if="selectedItem != null"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          @click="
            () => {
              showModalInputName = 'rename';
              inputName = selectedItem?.name || '';
            }
          "
        >
          Rename '{{ selectedItem.name }}'
        </div>
        <div
          v-if="selectedItem != null"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
          @click="deleteFile(selectedItem)"
        >
          Delete '{{ selectedItem.name }}'
        </div>
      </div>
    </Teleport>
    <!-- Navbar -->
    <div class="flex gap-2 p-2 bg-gray-50 border-b">
      <div class="flex gap-1">
        <button
          class="px-3 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          @click="goBack"
          :disabled="navigateIndex === 0"
          :class="{ 'opacity-50 cursor-not-allowed': navigateIndex === 0 }"
        >
          <Icon icon="material-symbols:arrow-back" class="text-gray-600" />
        </button>
        <button
          class="px-3 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          @click="goForward"
          :disabled="navigateIndex >= navStack?.length - 1"
          :class="{ 'opacity-50 cursor-not-allowed': navigateIndex >= navStack?.length - 1 }"
        >
          <Icon icon="material-symbols:arrow-forward" class="text-gray-600" />
        </button>
        <button
          class="px-3 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          @click="uploadFile"
        >
          <Icon icon="material-symbols:arrow-upward" class="text-gray-600" />
        </button>
      </div>
      <div class="flex-grow">
        <input
          type="text"
          v-model="currentPath"
          @keyup.enter="navigateTo(currentPath)"
          class="w-full px-4 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div class="flex-none w-64">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search files & folders..."
            class="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="refresh"
          />
          <Icon
            icon="material-symbols:search"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-grow h-full">
      <!-- Sidebar -->
      <div class="w-56 bg-gray-50 p-2">
        <div class="space-y-1 h-full">
          <!-- <Tree :value="treeFS?.items" selectionMode="single"> </Tree> -->

          <v-treeview
            class="h-full overflow-y-auto"
            v-model:opened="openedFolders"
            v-model:activated="selectedFolders"
            active-class="active-node"
            single-select
            item-value="id"
            :items="treeFS?.items"
            item-props="isOpen"
            dense="compact"
          >
            <template v-slot:prepend="{ item, isOpen }">
              <div class="flex flex-row justify-start items-center" @click="selectFolder(item)">
                <div class="w-8 hover:bg-gray-100 rounded transition-colors">
                  <v-icon
                    v-if="item.childrenCount > 0"
                    class="text-gray-500"
                    :class="{ 'loading-spin': item.loading }"
                    @click="onNodeClick(item)"
                  >
                    {{
                      item.loading
                        ? "mdi-loading"
                        : item.isOpen
                        ? "mdi-chevron-down"
                        : "mdi-chevron-right"
                    }}
                  </v-icon>
                </div>
                <v-icon class="text-gray-500">
                  {{ isOpen ? "mdi-folder-open" : "mdi-folder" }}
                </v-icon>
                <span class="ml-2">{{ item.name }} </span>
              </div>
            </template>
          </v-treeview>
        </div>
      </div>

      <!-- File List -->
      <div
        class="flex-grow flex flex-col h-full"
        @click="closeContextMenu"
        @contextmenu="handleContextMenu($event, selectedItem as any)"
      >
        <div class="flex bg-gray-50 px-6 py-2">
          <div class="w-2/5 font-medium text-gray-600">Name</div>
          <div class="w-1/5 font-medium text-gray-600">Date modified</div>
          <div class="w-1/5 font-medium text-gray-600">Type</div>
          <div class="w-1/5 font-medium text-gray-600">Size</div>
        </div>
        <div class="flex-grow overflow-y-auto">
          <div
            v-if="!currentLS?.items || currentLS.items.length === 0"
            class="flex justify-center items-center h-full"
          >
            <span class="text-gray-500">This Folder is empty</span>
          </div>
          <div
            v-else
            v-for="file in currentLS.items"
            :key="file.id"
            class="flex px-6 py-1 cursor-pointer hover:bg-blue-50 transition-colors rounded-lg mx-2 my-1"
            :class="{
              'bg-blue-50': selectedItem?.id === file.id,
              active: file.id === selectedItem?.id,
            }"
            @leftclick="selectedItem = file"
            @click="selectedItem = file"
            @dblclick="
              () => {
                if (file.type == FSType.FOLDER) {
                  navigateTo(urlJoin(currentPath, file.name));
                } else if (file.type == FSType.FILE) {
                  openFile(file);
                }
              }
            "
          >
            <div class="w-2/5 flex items-center">
              <Icon
                :icon="file.type === 2 ? 'mdi-folder' : 'mdi-file'"
                class="mr-3 text-gray-500"
              />
              <span class="text-gray-700">{{ file.name }}</span>
            </div>
            <div class="w-1/5 text-gray-600">
              {{ new Date(file.updated_at).toLocaleDateString() }}
            </div>
            <div class="w-1/5 text-gray-600">{{ file.type === 2 ? "Folder" : "File" }}</div>
            <div class="w-1/5 text-gray-600">
              {{ file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + " MB" : "-" }}
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-6 py-2 bg-white border-t">
          <div class="flex items-center text-sm text-gray-600 font-medium space-x-4">
            <span
              >Showing {{ currentLS?.page || 0 }}-{{ currentLS?.totalPages || 0 }} of
              {{ currentLS?.totalItems || 0 }} items</span
            >
          </div>

          <div class="flex items-center space-x-2 h-10">
            <div class="flex items-center space-x-2 mr-3">
              <span class="text-gray-600 text-sm">Items per page:</span>
              <input
                type="number"
                v-model="currentLS_ItemPerPage"
                min="1"
                max="100"
                class="w-16 h-8 px-2 py-1 ml-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="refresh()"
              />
            </div>
            <button
              @click="currentLS_Page > 1 && changePage(currentLS_Page - 1)"
              :disabled="currentLS_Page === 1"
              class="h-8 mr-2 flex items-center px-2 py-1.5 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Icon icon="mdi-chevron-left" class="w-5 h-5 mr-1" />
            </button>

            <div class="flex items-center space-x-1">
              <div class="flex items-center space-x-2">
                <input
                  type="number"
                  v-model="currentLS_Page"
                  :min="1"
                  :max="currentLS?.totalPages"
                  class="w-16 h-8 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  @change="changePage(currentLS_Page)"
                />
              </div>
            </div>

            <button
              @click="currentLS_Page < currentLS?.totalPages! && changePage(currentLS_Page + 1)"
              :disabled="currentLS_Page === currentLS?.totalPages"
              class="h-8 flex items-center px-2 py-1.5 ml-2 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Icon icon="mdi-chevron-right" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.active-node) {
  background-color: #f6f2ff !important; /* Warna oranye */
  color: black !important;
  border-radius: 5px;
  padding: 5px;
}
:deep(.context-menu) {
  min-width: 200px;
}
:deep(.v-list-item-action) {
  display: none !important;
}
:deep(.v-icon.loading-spin) {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
<script lang="ts">
export default defineComponent({
  name: "File Explorer",
  components: {
    Icon,
    Tree,
  },
  data() {
    return {};
  },
  methods: {},
  beforeUnmount() {},
});
</script>
