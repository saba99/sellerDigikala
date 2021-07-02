<template>
   <div>
       <div style="margin-bottom:40px">
            <div class="panel">
                <div class="header">
                    نمودار میزان فروش این ماه فروشگاه
                </div>
                <div class="panel_content">
                    <highcharts :options="chartOptions"></highcharts>
                </div>
            </div>
        </div>
   </div>
</template>

<script>
import myMinix from '../assets/myMixin';
import {Chart} from 'highcharts-vue'

export default {
    mixins:[myMinix],
    data(){
        const app=this;
        return {
            chartOptions:{
                chart:{
                    type:'line',
                    style:{
                       fontFamily:'Yekan'
                    }
                },
                title: {
                    text: ''
                },    
                subtitle: {
                    text: ''
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
                         return '<div style="direction:ltr">'
                         +'<span>'+value+'</span>'
                         +'</div>';
                      },
                    },
                    style:{
                        fontSize:'15px'
                     } 
                },
                legend: {
                    verticalAlign: 'top',
                    y:0
                },
                xAxis: {
                    categories:[]
                },
                series: [{
                     name: 'میزان فروش',
                     data: [],
                     color:'red'
                },{
                    name: 'تعداد تراکنش',
                    data: [],
                    marker:{
                       symbol:'circle'
                    }
               }],
               tooltip:{
                    useHTML:true,
                    formatter:function()
                    {
                       if(this.series.name=='میزان فروش'){
                          return this.x+'<br>'+'<div style="padding:5px">'+this.series.name+' : '+app.replaceNumber(app.number_format(this.y))+' تومان'+'</div>';
                       }
                       else{
                        return this.x+'<br>'+'<div style="padding:5px">'+this.series.name+' : '+app.replaceNumber(app.number_format(this.y))+' بار'+'</div>';
                      } 
                    },
                    style:{
                       fontSize:'15px'
                   }  
                },
               responsive: {
                   rules: [{
                      condition: {
                      maxWidth: 500
                   },
                  chartOptions: {
                      legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                  }
                }]
              }
            },
            account_status:'active',
            showLoading:false
        }
    },
    mounted(){
        this.getData();
    },
    components: {
       highcharts: Chart
    },
    methods:{
        getData()
        {
            const app=this;
            const url=this.$siteUrl+'/api/orders/get_month_sales_statistics';
            this.axios.get(url,this.setHeader()).then(response=>{
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                   this.chartOptions['series'][0]['data']=[];
                   this.chartOptions['series'][1]['data']=[];
                   let price=response.data.price_array;
                   let count=response.data.count_array;
                   this.chartOptions['xAxis']['categories']=response.data.date_list;
                   price.forEach(function(row){
                       app.chartOptions['series'][0]['data'].push(row);
                   });
                   count.forEach(function(row){
                       app.chartOptions['series'][1]['data'].push(row);
                   })
                }
                this.$emit('show_account_status');
            }).catch((error)=>{
                this.setCatch(error);
            });
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
        },show_server_error: function () {
            this.server_error = true;
            const app = this;
            setTimeout(function () {
                app.server_error = false
            }, 5000);
        },
    }
}
</script>

<style>

</style>