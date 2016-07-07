/**
 * Created by Administrator on 2016/3/24.
 */
'use strict';

angular.module('dleduWebApp')

  .controller('evaCtrl', function ($scope, $http, $timeout, $state, EvaService, $window, ngDialog, BusinesssetService,
                                   MainService, toolsService) {

    $scope.selectInfor = {
      offset: toolsService.getBasicParam().offset,
      limit: toolsService.getBasicParam().limit,
      status: 'created'
    };

    /**
     * 分页查询
     * @return {[type]} [description]
     */
    $scope.find = function (index) {
      toolsService.find($scope, index);
    };
    /**
     * 创建页码
     * @param  {[type]} size [description]
     * @return {[type]}      [description]
     */
    $scope.createArray = function () {
      toolsService.createArray($scope);
    };




    //出勤状态
    $scope.starLevel = [{value:5, name:'5星',check:true},{value:4, name:'4星',check:true}, {value:3,name:'3星',check:true},
      {value:2,name:'2星',check:true}, {value:1,name:'1星',check:true}];
    //选择出勤状态值
    $scope.selected = [1,2,3,4,5];
    //全选
    $scope.isAll = true;
    $scope.allSel = function($event){
      var checkbox = $event.target;
      $scope.isAll = checkbox.checked;
      $scope.selected = [];
      if(checkbox.checked){
        for(var i = 0; i < $scope.starLevel.length; i++){
          $scope.starLevel[i].check = true;
          $scope.selected.push($scope.starLevel[i].value);
        }
      }else{
        for(var j = 0; j < $scope.starLevel.length; j++){
          $scope.starLevel[j].check = false;
        }
      }
    }
    //更新选择的状态值
    var updateSelected = function(action, id){
      if(action == 'add' && $scope.selected.indexOf(id) == -1){
        $scope.selected.push(id);
      }
      if(action == 'remove' && $scope.selected.indexOf(id) != -1){
        var idx = $scope.selected.indexOf(id);
        $scope.selected.splice(idx,1);
      }
    }
    //更新选择的状态值
    $scope.updateSelection = function($event, id){
      var checkbox = $event.target;
      var action = (checkbox.checked ?  'add' : 'remove');
      updateSelected(action, id);
      if($scope.selected.length != $scope.starLevel.length){
        $scope.searchObj.selectAll = false;
      }else{
        $scope.searchObj.selectAll = true;
      }
    }


    //导出数据
    $scope.export = function(){
      ngDialog.openConfirm({
        template: 'app/main/export_file_dialog.html',
        scope: $scope,
        plain: false,
        width: 550
      }).then(
        function(value) {
          var fileName = 'test';
          window.location = "/api/evaluation/exportExcel/" + angular.toJson({name: fileName, age:20});
        },
        function(reason) {

        }
      );
      /*var colSelected = $scope.colSelected;
      //学院名称
      var collegeId;
      if(colSelected){
        collegeId = colSelected.id;
      }
      EvaService.exportExcel({collegeId: collegeId, personId: $scope.personId, status:  $scope.selectInfor.status,
          offset: $scope.selectInfor.offset, limit: $scope.selectInfor.limit})
        .success(function(data){

        });*/
    }
  })
