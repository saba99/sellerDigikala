<template>
    <div class="breadcrumb">
        <ul class="list-inline">
            <li>
                <router-link to='/'>
                   <span class="fa fa-home"></span>
                   <span>پیشخوان</span>
                   <span class="fa fa-angle-left" v-if="data.length>0"></span>
               </router-link>
           </li>
           <li v-for="(item,key) in data" :key=key>
                <router-link :to='item.path'>
                    <span>{{ item.title }}</span>
                    <span class="fa fa-angle-left" v-if="key!=(data.length-1)"></span>

                </router-link>
           </li>


            <li class="date_li">
              <span class="fa fa-calendar"></span>
              <span> امروز </span>
              <span> {{  this.Day_of_week() }} </span>
              <span> {{ day }} </span>
              <span> {{ month }} </span>
              <span> {{ year }} </span>
           </li>
        </ul>
    </div>
</template>

<script>
import myMinix from '../assets/myMixin';

export default {
    name:"Breadcrumb",
    props:['data'],
    mixins:[myMinix],
    data(){
        return{
            day:'',
            month:'',
            year:'',
            week:[
                'یکشنبه',
                'دوشنبه',
                'سه شنبه',
                'چهار شنبه',
                'پنج شنبه',
                'جمعه',
                'شنبه',
            ],
            monthList:[
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
            ]
        }
    },
    mounted()
    {
        this.set_date();
    },
    methods:{
        set_date:function()
        {
            const ndf=new Date();
            const y=ndf.getFullYear();
            const m=(ndf.getMonth()+1);
            const d=ndf.getDate();

            const shamsi=this.gregorian_to_jalali(y,m,d);
            this.day=this.replaceNumber(shamsi[2]);
            this.year=this.replaceNumber(shamsi[0]);
            this.month=this.monthList[(shamsi[1]-1)];
        },
        Day_of_week:function()
        {
            var d=new Date();
            return this.week[d.getDay()];
        },
        
    gregorian_to_jalali: function (gy, gm, gd) {
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
    }
}
</script>

<style>

</style>