<template>
    <div>
        <loading v-if="showLoading"></loading>
        <account-status :account_status="account_status"></account-status> 
        <MonthSalesStatistics @show_account_status="show_account_status"></MonthSalesStatistics>

        <div class="panel">
             <div class="header">
                 آخرین سفارشات ثبت شده
             </div>
             <div class="panel_content">
                 <order-table v-bind:orderList="orderList" :page="page"></order-table>
             </div>
            
        </div> 
    </div>
</template>

<script>
import MonthSalesStatistics from './MonthSalesStatistics.vue';
import OrderTable from './OrderTable';
import myMixin from '../assets/myMixin';
export default {
    components:{MonthSalesStatistics,OrderTable},
    mixins:[myMixin],
    data(){
        return {
            account_status:'active',
            showLoading:false,
            page:1,
            orderList:{data:[]}
        }
    },
    mounted(){
       this.account_status=localStorage.getItem('account_status');
       this.getOrders(1);
    },
    methods:{
        show_account_status:function()
        {
           this.account_status=localStorage.getItem('account_status');
        },
        getOrders:function(page=1){
            this.page=page;
            this.showLoading=true;
            const url=this.$siteUrl+'/api/seller/orders?page='+page;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    this.orderList=response.data;
                }
            }).catch((error)=>{
                this.showLoading=false;
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
        },
    }
}
</script>

<style>

</style>