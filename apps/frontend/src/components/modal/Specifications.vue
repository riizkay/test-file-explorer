<script setup lang="ts">
import { defineComponent } from "vue";
import Modal from "./Modal.vue";
defineProps<{ show: boolean; onClose: () => void }>();
</script>
<template>
  <Modal :show="show" width="500px">
    <div class="flex flex-col w-[100%]">
      <div class="flex-grow text-gray-800 p-6">
        <h1 class="text-3xl font-bold mb-6 text-slate-900">Technical Specifications</h1>
        <div class="space-y-6">
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Collapsible and Expandable Interface</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Advanced Search Functionality</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Modern UI Components</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Hexagonal/Clean Architecture</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Service and Repository Layer Implementation</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Bun Runtime (NodeJS Alternative)</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Elysia Framework Integration</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">Monorepo Architecture</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span class="text-slate-700">ORM Implementation</span>
            </div>
          </div>

          <div class="pt-4">
            <h2 class="text-xl font-semibold mb-4 text-slate-900">Scalability Features</h2>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div
                  class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <span class="text-slate-700">Redis Caching System</span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <span class="text-slate-700">Lazy Loading Implementation</span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <span class="text-slate-700">Load Balancer Integration</span>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <span class="text-slate-700">CDN Implementation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <v-btn class="bg-blue-500 text-white px-4 py-1.5 rounded-lg" @click="onClose">
          Close
        </v-btn>
      </div>
    </div>
  </Modal>
</template>
