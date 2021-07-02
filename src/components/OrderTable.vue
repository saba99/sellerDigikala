<template>
  <div>
       <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>ردیف</th>
                    <th>تصویر محصول</th>
                    <th>عنوان محصول</th>
                    <th>مبلغ فروش</th>
                    <td>زمان ثبت</td>
                    <th>وضعیت</th>
                    <th>جزییات</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(order,key) in orderList.data" :key="order.id">
                    <td>{{ getRow(key) }}</td>
                    <td>
                        <img :src="$siteUrl+'/files/thumbnails/'+order.get_product.image_url" class="product_pic" style="width:80px;margin:10px">
                    </td>
                    <td>
                        {{ order.get_product.title }}
                     </td>
                    <td style="min-width:150px">
                        {{ replaceNumber(number_format(order.product_price2)) }} تومان
                    </td>
                    <td>
                        {{ getDate(order.time,'format') }}
                    </td>
                    <td style="min-width:200px;font-size:13px">
                        <span :class="[order.send_status<1 ? 'alert alert-danger' : 'alert alert-success']">
                            {{ get_status(order.send_status) }}
                        </span>
                    </td>
                    <td>
                        <span class="fa fa-eye" v-on:click="show_order_info(key)" :style="[order.seller_read=='no' ? {color:'red'} : {}]"></span>
                    </td>
                </tr>
                <tr v-if="orderList.data.length==0">
                       <td colspan="7">رکوردی یافت نشد</td>
               </tr>
            </tbody>
       </table>  

        <b-modal ref="my-modal" class="modal" tabindex="-1" role="dialog" id="orderInfo">
            <div class="modal-dialog modal-lx" role="document" style="min-width:900px">
                <div class="modal-content">
                     <div class="modal-header">
                        <h5 class="modal-title">جزییات سفارش</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                             <span aria-hidden="true">&times;</span>
                        </button>
                     </div>
                    <div class="modal-body">
                        <table v-if="selected_key>-1" class="table table-bordered table-striped">
                            <tbody>
                                <tr>
                                    <td>عنوان محصول</td>
                                    <td>{{ orderList.data[selected_key].get_product.title }}</td>
                                 </tr>
                                <tr v-if="orderList.data[selected_key].get_warranty!=null">
                                     <td>گارانتی</td>
                                    <td>{{ orderList.data[selected_key].get_warranty.name }}</td>
                                </tr>
                                <tr v-if="orderList.data[selected_key].get_color!=null">
                                    <td>رنگ</td>
                                    <td>{{ orderList.data[selected_key].get_color.name }}</td>
                                </tr>
                                <tr>
                                    <td>تعداد فروش</td>
                                    <td>{{ replaceNumber(orderList.data[selected_key].product_count) }}</td>
                                 </tr>
                                 <tr v-if="(!orderList.data[selected_key].hasproduct_count || orderList.data[selected_key].getprepartionproduct_count>orderList.data[selected_key].hasproduct_count) && (orderList.data[selected_key].send_status<3 && orderList.data[selected_key].send_status>0)">
                                    <td>زمان آماده سازی محصول</td>
                                    <td>{{ replaceNumber(orderList.data[selected_key].preparation_time) }} روز بعد از خرید</td>
                                </tr>
                                 <tr v-if="orderList.data[selected_key].send_status<3 && orderList.data[selected_key].send_status>0">
                                    <td>تعداد لازم برای ارسال</td>
                                    <td>
                                        <span v-if="orderList.data[selected_key].getprepartionproduct_count">
                                                    {{ replaceNumber(orderList.data[selected_key].getprepartionproduct_count) }}
                                        </span>
                                        <span v-else>-</span>
                                     </td>
                                </tr>

                                <tr v-if="orderList.data[selected_key].send_status<3 && orderList.data[selected_key].send_status>0">
                                    <td style="width:200px">موجودی محصول در انبار</td>
                                    <td>
                                        <span v-if="orderList.data[selected_key].hasproduct_count">
                                             {{ replaceNumber(orderList.data[selected_key].hasproduct_count) }}
                                        </span>
                                        <span v-else>-</span>
                                    </td>
                                </tr>

                                <tr v-if="orderList.data[selected_key].send_status<3 && orderList.data[selected_key].send_status>0">
                                    <td style="width:200px">تعداد لازم برای ارسال به انبار</td>
                                     <td>
                                         <div v-if="orderList.data[selected_key].hasproduct_count">
                                            <span v-if="(orderList.data[selected_key].getprepartionproduct_count - orderList.data[selected_key].hasproduct_count)>0">
                                                {{ replaceNumber((orderList.data[selected_key].getprepartionproduct_count - orderList.data[selected_key].hasproduct_count)) }}
                                            </span>    
                                            <span v-else>-</span>
                                        </div>
                                        <div v-else>
                                            {{ replaceNumber(orderList.data[selected_key].getprepartionproduct_count) }}
                                        </div>
                                    </td>
                                 </tr>

                                <tr>
                                    <td>وضعیت</td>
                                    <td>{{ get_status(orderList.data[selected_key].send_status) }}</td>
                                </tr>

                                <tr v-if="orderList.data[selected_key].send_status==-1">
                                    <td>توضیحات</td>
                                    <td>{{ orderList.data[selected_key].tozihat }}</td>
                                 </tr>
                             </tbody>
                       </table>
                   </div>
                 </div>
            </div>
        </b-modal>    
  </div>
</template>

<script>
import myMixin from '../assets/myMixin';

export default {
    mixins:[myMixin],
    props:['orderList','page'],
    data(){
        return {
            orderStatus:[
                'عدم پرداخت مبلغ سفارش',
                'مرجوع شده',
                'در انتظار پرداخت',
                'تایید سفارش',
                'آماده سازی سفارش',
                'خروج از مرکز پردازش',
                'تحویل به پست',
                'دریافت از مرکز مبادلات پست',
               'تحویل مرسوله به مشتری',
            ],
            selected_key:-1
        }
    },
    methods:{
        get_status:function(status)
        {
            status=status+2;
            return this.orderStatus[status];
        },
        show_order_info:function(key)
        {
           this.selected_key=key;
          /* global $ */
          $("#orderInfo ").modal('show');
           if(this.orderList.data[this.selected_key].seller_read=='no')
           {
              const order_id=this.orderList.data[this.selected_key].order_id;
              this.readOrderRequest(order_id,this.selected_key);
           }
        },
        readOrderRequest:function(id,selected_key)
        {
            const url=this.$siteUrl+'/api/seller/order/read/'+id;
            this.axios.get(url,this.setHeader()).then(response=>{
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                   if(response.data=='ok')
                   {
                     this.orderList.data[selected_key].seller_read='ok';
                   }
                   else{
                       this.show_server_error();
                   }
                }
            }).catch((error)=>{
                this.setCatch(error);
            });
            
        },
        getRow: function (n, count) {
            count = count == undefined ? 10 : count;
            var row = n + 1;
            row = row + (this.page - 1) * count;
            return this.replaceNumber(row);
        },
        getDate: function (time, format) {
            time = time * 1000;
            const date = new Date(time);
            let r = '';
            const jalali = this.gregorian_to_jalali(date.getFullYear(), (date.getMonth() + 1), date.getDate());
            if (format == undefined) {
                r = this.replaceNumber(jalali[2]) + " " + this.monthName[(jalali[1] - 1)] + " " + this.replaceNumber(jalali[0]);
            }
            else {
                r = this.replaceNumber(jalali[0]) + "/" + this.replaceNumber(jalali[1]) + "/" + this.replaceNumber(jalali[2]);
            }
            return r;
        },gregorian_to_jalali: function (gy, gm, gd) {
            var g_d_m, jy, jm, jd, gy2, days;
            g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            if (gy > 1600) {
                jy = 979;
                gy -= 1600;
            } else {
                jy = 0;
                gy -= 621;
            }
            gy2 = (gm > 2) ? (gy + 1) : gy;
            days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
            jy += 33 * (parseInt(days / 12053));
            days %= 12053;
            jy += 4 * (parseInt(days / 1461));
            days %= 1461;
            if (days > 365) {
                jy += parseInt((days - 1) / 365);
                days = (days - 1) % 365;
            }
            jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
            jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
            return [jy, jm, jd];
        },
       
        setHeader: function (image) {
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