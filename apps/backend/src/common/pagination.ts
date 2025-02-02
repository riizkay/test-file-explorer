import { Sequelize, Op as op } from "sequelize";
import { PaginationResult } from "@shared/types";
async function paginate(
  model: any,
  perPage: number,
  page: number,
  query: any,
  modifyCallback: any = {},
  addcolumns: any = {},
  searchFields: any = null,
  keyword: any = null,
  pluck: any = null,
  orderBy: any = null,
  _removeColumns: any = []
) {
  var ret: any = {};
  var offset = (Number(page) - 1) * perPage;
  var limit = perPage;

  // var query = null;
  var totalCount: any = 0;
  var totalPages = 0;
  var data = [];

  if (keyword) {
    if (keyword.length > 0 && searchFields != null) {
      var subCriteria: any = {};

      if (!("where" in query)) query.where = {};
      for (const searchField of searchFields) {
        subCriteria[`$${searchField}$`] = { [op.like]: `%${keyword}%` };
        // var crit = {}
        // query.where[searchField] = `${keyword}`;
        // crit[searchField] = new RegExp(`${keyword}`, "i") //find with %search% ignore case
        // subCriteria.push(crit)
      }
      query.where[op.or] = subCriteria;
      // console.log(subCriteria,'aaaaaaaaaaaaaaaaaaaaaaa')
      // console.log(crit,'aaaaaa');
      // var subCriteria = []
      // for (const searchField of searchFields){
      //     var crit = {}
      //     crit[searchField] = new RegExp(`${keyword}`, "i") //find with %search% ignore case
      //     subCriteria.push(crit)
      // }
      // if ( Object.keys(subCriteria).length > 0)
      //     __find.query.$or = subCriteria;
    }
  }

  if (orderBy != null) {
    query.order = orderBy;
    // query.sort(orderBy);
  }
  totalCount = await model.count(query);

  query.limit = limit;
  query.offset = offset;
  data = await model.findAll(query);

  // console.log(data.toJSON());
  var tojs = false;
  if ("raw" in query) {
    if (query.raw == false) tojs = true;
  } else tojs = true;
  if (tojs) {
    var newDat = [];

    for (const dat of data) {
      var row = dat.toJSON();
      newDat.push(row);
    }

    data = newDat;
  }

  totalPages = Math.ceil(parseFloat(totalCount) / parseFloat(perPage.toString()));

  var i = 1;
  var indexColumn = false;
  data = await Promise.all(
    data.map(async (d: any) => {
      if (addcolumns != null) {
        for (const key in addcolumns) {
          if (key == "#") indexColumn = true;
          else d[key] = await addcolumns[key](d);
        }
      }

      i = i + 1;
      return d;
    })
  );
  data = await Promise.all(
    data.map(async (d: any) => {
      if (modifyCallback != null) {
        for (const key in d) {
          if (key in modifyCallback) {
            d[key] = await modifyCallback[key](d);
          }
        }
      }

      i = i + 1;
      return d;
    })
  );
  var i = 1;
  if (indexColumn) {
    data = data.map((d) => {
      d["#"] = offset + i;
      i = i + 1;
      return d;
    });
  }

  if (pluck != null) {
    data = data.map((d) => {
      var arr = [];
      for (const key of pluck) {
        var textAdd = d[key] || "";
        arr.push(textAdd);
      }

      return arr;
    });
  }

  if (_removeColumns.length > 0) {
    for (const rem of _removeColumns) {
      data = data.map((d) => {
        delete d[rem];
        return d;
      });
    }
  }

  ret.items = data;
  ret.totalItems = totalCount;
  ret.totalPages = totalPages;
  ret.perPage = perPage;
  ret.page = page;
  if (page >= totalPages) ret.hasNext = false;
  else ret.hasNext = true;

  return ret;
}
export interface PaginationInterface<T> {
  orderBy: (d: string[][]) => PaginationInterface<T>;
  removeColumns: (d: string[]) => PaginationInterface<T>;
  addIndexColumn: () => PaginationInterface<T>;
  editColumn: (name: string, callback: (row: T) => void) => PaginationInterface<T>;
  addColumn: (name: string, callback: (row: T) => void) => PaginationInterface<T>;
  canSearch: (searchField: string, keyword: string) => PaginationInterface<T>;
  pluck: (searchField: string[]) => PaginationInterface<T>;
  get: () => Promise<PaginationResult<T>>;
  iterate: (callback: (row: T) => void) => Promise<void>;
}
const Pagination = {
  sequelize: <T>(model: any, perPage: number, page: number, query: any): PaginationInterface<T> => {
    var ret: any = {};
    ret._modifyCallback = {};
    ret.searchField = [];
    ret.__orderBy = null;
    ret.__query = query;

    ret.keyword = [];
    ret._addColumns = {};
    ret._removeColumns = [];
    ret._pluck = null;

    ret.orderBy = function (d: string[]) {
      ret.__orderBy = d;
      return ret;
    };
    ret.removeColumns = function (columns: string[]) {
      ret._removeColumns = columns;
      return ret;
    };
    ret.addIndexColumn = function () {
      ret._addColumns["#"] = null;
      return ret;
    };
    ret.editColumn = function (name: string, callback: (row: any) => void) {
      ret._modifyCallback[name] = callback;
      return ret;
    };
    ret.addColumn = function (name: string, callback: (row: any) => void) {
      ret._addColumns[name] = callback;
      return ret;
    };
    ret.canSearch = function (searchField: string, keyword: string) {
      ret.searchField = searchField;
      ret.keyword = keyword;
      return ret;
    };
    ret.pluck = function (pluck: string[]) {
      ret._pluck = pluck;
      return ret;
    };
    ret.get = async function (pageFetch?: number) {
      var pg = page;
      if (pageFetch) pg = pageFetch;
      return await paginate(
        model,
        perPage,
        pg,
        query,
        ret._modifyCallback,
        ret._addColumns,
        ret.searchField,
        ret.keyword,
        ret._pluck,
        ret.__orderBy,
        ret._removeColumns
      );
    };
    ret.iterate = async function (callback: (row: T) => void) {
      var p = 1;
      var data = await ret.get(p);

      while (1) {
        for (const row of data.items) {
          await callback(row);
        }
        if (!data.hasNext) break;
        p++;
        data = await ret.get(p);
      }
    };
    return ret;
  },
};
export default Pagination;
