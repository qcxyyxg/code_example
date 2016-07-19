/**
 * Created by Administrator on 2016/3/29.
 */
      createArray: function(scope){
        var size = 5; //最多显示页数
        scope.prevS = false;
        scope.nextS = false;
        scope.isShowFirstLast = false;
        var startPage, endPage;
        if (size + 4 >= scope.records.pageCount) {
          scope.prevS = false;
          scope.nextS = false;
          scope.pageInfor = [];
          startPage = 1;
          endPage = scope.records.pageCount;
        } else {
          scope.isShowFirstLast = true;
          startPage = 2,
          endPage = scope.records.pageCount - 1;
          var prevReduce = ~~(size / 2);
          var nextAdd = prevReduce;
          if (~~(size % 2) == 0) {
            prevReduce--;//showPageRange为偶数时，currentPage前面显示的页码链接数比后面显示的链接数少一个
          }
          if (prevReduce < 0) {//修正当showPageRange被设置为1导致的负数
            prevReduce = 0;
          }
          startPage = scope.records.offset - prevReduce;
          if (startPage < 2) {
            startPage = 2;
          }//修正startPage
          endPage = scope.records.offset + nextAdd;
          if (endPage - startPage < size) {
            endPage = startPage + size - 1;
          }//根据startPage修正endPage
          if (endPage > scope.records.pageCount - 1) {
            endPage = scope.records.pageCount - 1;
            startPage = endPage - size + 1;
          }//修正endPage,并同步修正startPage
          if (startPage <= 3) {//再次修正startPage
            startPage = 2;
          }
          if (endPage > scope.records.pageCount - 3) {//再次修正endPage
            endPage = scope.records.pageCount - 1;
          }
          scope.prevS = startPage - 1 > 1;
          scope.nextS = endPage + 1 < scope.records.pageCount;
          if (scope.prevS) {
            scope.prevS = true;
          }
          if (scope.nextS) {
            scope.nextS = true;
          }
          scope.pageInfor = [];
        }
        for (var i = startPage; i < endPage + 1; i++) {
          scope.pageInfor.push({
            index: i
          });
        }
      }
    }

	
	.dataTables_paginate.paging_bootstrap.pagination
                  ul.pagination.mg-tb-0.ver-middle
                    li.cur-default(ng-class="{true: 'disabled', false: ''}[records.offset == 1]" ng-click="find(records.offset - 1)")
                      a(aria-label="Previous") ← 上一页
                    li(ng-show="isShowFirstLast" ng-class="{true: 'active', false: ''}[records.offset == 1]")
                      a(ng-click="find(1)") {{1}}
                    li(ng-show="prevS")
                      span …
                    li.cur-default(ng-repeat="page in pageInfor" ng-class="{true: 'active', false: ''}[records.offset == page.index]" )
                      a(ng-click="find(page.index)") {{page.index}}
                    li(ng-show="nextS")
                      span …
                    li(ng-show="isShowFirstLast" ng-class="{true: 'active', false: ''}[records.offset == records.pageCount]")
                      a(ng-click="find(records.pageCount)") {{records.pageCount}}
                    li.cur-default(ng-class="{true: 'disabled', false: ''}[records.offset == records.pageCount]" ng-click="find(records.offset - 1 + 2)")
                      a(aria-label="Next") 下一页 →
