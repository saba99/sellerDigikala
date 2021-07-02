<template>
    <div>
        <loading v-if="showLoading"></loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status>
        <div class="panel">

             <div class="header">
                آمار فروش
             </div>

             <div class="panel_content">

                 <div v-if="account_status=='active'">
                    <p>
                      <span>میزان فروش در سال </span>
                      <select v-model="default_year" class="selectick auto_width years_tag" v-on:change="getData()" ref="default_year">
                         <option v-bind:value="year"  v-for="(year,key) in years" v-bind:key="key">{{ replaceNumber(year) }}</option>
                      </select>
                    </p>
                   <highcharts :options="chartOptions"></highcharts>

                    <div style="padding-top:50px">
                       <highcharts :options="chartOptions2"></highcharts>
                    </div>

                    <table class="table table-bordered table-striped"  style="margin-top:40px">
                       <tr>
                          <td style="width:50%">میزان فروش کل</td>
                          <td>{{ replaceNumber(number_format(tatal_sale)) }} تومان</td>
                       </tr>
                       <tr>
                          <td>کمیسون کسر شده</td>
                          <td>{{ replaceNumber(number_format(commission)) }} تومان</td>
                       </tr>
                     </table>
                 </div>
                 <div v-else>
                    <p style="padding-top:100px;text-align:center;font-size:50px">
                      <span class="fa fa-exclamation"></span>
                    </p>
                    <p style="text-align:center;padding-bottom:80px">شما دسترسی لازم برای عملیات جاری را ندارید</p>
                 </div>
             </div>

        </div>
        <server-error-message v-if="server_error"></server-error-message>  
    </div>
</template>

<script>
import myMixin from '../assets/myMixin';
import {Chart} from 'highcharts-vue';
export default {
    mixins:[myMixin],
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','report');
        this.getData();
    },
    components: {
       highcharts: Chart
    },
    data(){
        const app=this;
        return {
            showLoading:false,
            account_status:'active',
            BreadcrumbList:[
                { path:'/orders',title:'مدیریت سفارشات' },
                { path:'/orders/sale_statistics',title:'آمار فروش' },
            ],default_year:'',
            years:[],
            chartOptions: {
                   series: [{
                       data:[],
                       color:'rgb(244,81,108)',
                       dataLabels:{
                           enabled:true,
                           color:'#FFFFFF',
                           formatter:function(){
                               return app.replaceNumber(app.number_format(this.y));
                           },
                           rotation:-90,
                           style:{
                               fontSize:'16px'
                           },
                           align:'right',
                           y:10
                       }
                   }],
                   legend:{
                         enabled:false,
                   },
                   title:{
                       text:'',
                       update:true
                   },
                   xAxis:{
                      type:'category'
                   },
                   chart:{
                       type:'column',
                       style:{
                           fontFamily:'Yekan'
                       }
                   },
                   yAxis: {
                      title: {
                           text: ''
                      },
                      labels:{
                           useHTML:true,
                           formatter:function()
                           {
                               let value=this.value;
                               if(value>1000){
                                value=app.number_format(value);
                                }
                               value=app.replaceNumber(value);
                               return '<div style="direction:rtl">'
                               +'<span>'+value+' تومان</span>'
                                +'</div>';
                           },
                          style:{
                              fontSize:'15px'
                            } 
                       }
                   },
                   tooltip:{
                      useHTML:true,
                      formatter:function(){
                          return '<div style="width:210px;text-align:right">'+
                              '<p><span> میزان فروش در</span> '+ app.getMonthName((this.x+1))+' ماه</p>'+
                              '<div style="text-align:left;color:rgb(244,81,108);direction:rtl">'+
                                  '<span>'+ app.replaceNumber(app.number_format(this.y)) +'</span>'+
                                  '<span> تومان</span>'
                              +'</div>'
                          +'</div>';
                      },
                      style:{
                          fontSize:'16px'
                      }
                  }
            },
                        chartOptions2: {
                   series: [{
                       data:[],
                       dataLabels:{
                           enabled:true,
                           color:'#FFFFFF',
                           formatter:function(){
                               return app.replaceNumber(app.number_format(this.y));
                           },
                           rotation:-90,
                           style:{
                               fontSize:'16px'
                           },
                           align:'right',
                           y:10
                       }
                   }],
                   legend:{
                         enabled:false,
                   },
                   title:{
                       text:'کمیسیون دریافت شده از فروش محصول',
                       update:true,
                   },
                   xAxis:{
                      type:'category'
                   },
                   chart:{
                       type:'column',
                       style:{
                           fontFamily:'Yekan'
                       }
                   },
                   yAxis: {
                      title: {
                           text: ''
                      },
                      labels:{
                           useHTML:true,
                           formatter:function()
                           {
                               let value=this.value;
                               if(value>1000){
                                value=app.number_format(value);
                                }
                               value=app.replaceNumber(value);
                               return '<div style="direction:rtl">'
                               +'<span>'+value+' تومان</span>'
                                +'</div>';
                           },
                          style:{
                              fontSize:'15px'
                            } 
                       }
                   },
                   tooltip:{
                      useHTML:true,
                      formatter:function(){
                          return '<div style="width:250px;text-align:right">'+
                              '<p><span> میزان دریافت کمیسیون در</span> '+ app.getMonthName((this.x+1))+' ماه</p>'+
                              '<div style="text-align:left;color:rgb(244,81,108);direction:rtl">'+
                                  '<span>'+ app.replaceNumber(app.number_format(this.y)) +'</span>'+
                                  '<span> تومان</span>'
                              +'</div>'
                          +'</div>';
                      },
                      style:{
                          fontSize:'16px'
                      }
                  }
            },
            month:[
                'فروردین',
                'اردیبهشت',
                'خرداد',
                'تیر',
                'مرداد',
                'شهریور',
                'مهر',
                'آبان',
                'آذر',
                'دی',
                'بهمن',
                'اسفند'
            ],
            server_error:false,
            tatal_sale:0,
            commission:0
        }
    },
    methods:{
        getData:function()
        {
            this.url=this.$siteUrl+'/api/orders/get_sale_report?default_year='+this.default_year;
            this.showLoading=true;
            const app=this;
            this.axios.get(this.url,this.setHeader()).then(response=>{
               this.showLoading=false;
               this.chartOptions['series'][0]['data']=[];
                const sale=response.data.sale;
                if(sale!=undefined)
                {
                    sale.forEach(function(row,key){
                        if(key!=0)
                        {
                            app.chartOptions['series'][0]['data'].push([app.getMonthName(key),row]);
                        }
                    });
                }

                const commision=response.data.commision;
                if(commision!=undefined)
                {
                    commision.forEach(function(row,key){
                        if(key!=0)
                        {
                            app.chartOptions2['series'][0]['data'].push([app.getMonthName(key),row]);
                        }
                    });
                }

                this.years=response.data.year_list;
                this.default_year=response.data.default_year;
                this.tatal_sale=response.data.tatal_sale;
                this.commission=response.data.commission;
          
                // this.$nextTick(function(){
                //     $(this.$refs.default_year).selectpicker('refresh');
                // });
            }).catch((error)=>{
                this.setCatch(error);
            });
        },
        getMonthName:function(key){
            key=key-1;
            if(this.month[key]!=undefined)
            {
                return this.month[key];
            }
            else{
                 return'';
            }
        },setHeader: function (image) {
            const token = localStorage.getItem('token');
            if (image) {
                return {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'multipart/form-data'
                    }
                };
            }
            else {
                return {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                };
            }
        },
        setCatch: function (error) {
            this.showLoading = false;
            if (error.response) {
                if (error.response.status == 401) {
                    this.logout();
                }
                else {
                    this.show_server_error();
                }
            }
            else {
                this.show_server_error();
            }
        },setAccountStatus: function (data) {
            if (data.error_access == 'ok') {
                this.account_status = data.account_status;
                localStorage.setItem('account_status', data.account_status);
                return false;
            }
            else {
                this.account_status = 'active';
                localStorage.setItem('account_status', 'active');
                return true;
            }
        },
    }
}
</script>

<style>

</style>
