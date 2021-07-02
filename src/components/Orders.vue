<template>
   <div>
        <loading v-if="showLoading"></Loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 

       <div class="panel">
            <div class="header">
                مدیریت سفارشات
            </div>
            <div class="panel_content">
                <div v-if="account_status=='active'">

                <div class="search_form order_search">
                    <input type="text" v-model="title" placeholder="نام محصول" class="form-control" style="margin-left:20px">
                    <!-- <pdatepicker v-model="date" 
                       placeholder="تاریخ ثبت سفارش" 
                       input-class="form-control" 
                       hover-day-back-color="#00bfd6"
                       header-background-color="#00bfd6"
                       chosen-day-back-color="#00bfd6">
                    </pdatepicker> -->

                    <button class="btn btn-primary" v-on:click="getOrders(1)" style="margin-right:20px">جست و جو</button>
                </div>

                <order-table v-bind:orderList="orderList" :page="page"></order-table>

                <pagination :data="orderList" @pagination-change-page="getOrders"></pagination>

                
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
import OrderTable from './OrderTable';

export default {
    components:{OrderTable},
    mixins:[myMixin],
    data(){
        return {
            showLoading:false,
            account_status:'active',
            BreadcrumbList:[
                { path:'/orders',title:'مدیریت سفارشات' },
            ],
            server_error:false,
            orderList:{data:[]},
            monthName:[
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
            date:'',
            title:'',
            page:1
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','orders');
        this.getOrders();

    },
    methods:{
        getOrders:function(page=1){
            this.page=page;
            this.showLoading=true;
            const url=this.$siteUrl+'/api/seller/orders?page='+page+'&title='+this.title+'&date='+this.date;
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