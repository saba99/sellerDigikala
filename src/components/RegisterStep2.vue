<template>
    <div class="register">
        <div class="form-group">
            <input type="text" :class="[brand_error ? 'form-control validate_error_border' : 'form-control' ]" v-model="brand_name" placeholder="نام تجاری خود را وارد نمایید">
            <p v-if="brand_error" class="has_error"> {{ brand_error }}</p>
        </div>

      <div class="form-group">
           <input type="text" :class="[fname_error ? 'form-control validate_error_border' : 'form-control' ]" v-model="fname" placeholder="نام کامل مطابق با کارت ملی">
            <p v-if="fname_error" class="has_error"> {{ fname_error }}</p>
        </div>
        <div class="form-group">
            <input type="text" :class="[lname_error ? 'form-control validate_error_border' : 'form-control' ]" v-model="lname" placeholder="نام خانوادگی کامل مطابق با کارت ملی">
            <p v-if="lname_error" class="has_error"> {{ lname_error }}</p>
        </div>
     
        <div class="form-group">
            <div class="row">
              <div class="col-6">
                 <select v-on:change="get_city()" v-model="province_id" :class="[province_error ? 'custom-select validate_error_border' : 'custom-select' ]">
                  <option value="" >انتخاب استان</option>
                  <option v-for="province in ProvinceList" v-bind:value="province.id" v-bind:key="province.id">{{ province.name }}</option>
                 </select>
              </div>

             <div class="col-6">
                <select v-model="city_id" :class="[city_error ? 'custom-select validate_error_border' : 'custom-select' ]">
                  <option value="" >انتخاب شهر</option>
                  <option v-for="city in CityList" v-bind:value="city.id" v-bind:key="city.id">{{ city.name }}</option>
                </select>
             </div>
          </div>
        </div>

         <div>
            <p v-if="province_error" class="has_error"> {{ province_error }}</p>
            <p v-if="city_error" class="has_error"> {{ city_error }}</p>
        </div>

        <div class="form-check" style="margin-top:15px">
            <span style="padding-left:10px">ثبت نام به صورت : </span>
            <input v-model="account_type"  class="form-check-input" type="radio"  id="personal" value="1">
            <label class="form-check-label register_label" for="personal">شخصی</label>

            <input class="form-check-input" v-model="account_type" type="radio"  id="commercial" value="2">
            <label class="form-check-label register_label" for="Commercial">تجاری</label>
        </div>
    <div class="form-group btn_div" style="margin-top:25px">
             <button class="btn btn-success" v-on:click="send_data()">ثبت و ادامه</button>
        </div>
         <div class="alert alert-warning" id="spinner" v-if="send_form">
            <div class="spinner-border text-warning" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <span style="padding-right:10px;font-size:14px">در حال ارسال اطلاعات ...</span>
        </div>
 </div> 

     
</template> 
 <script>
 
import myMinix from '../assets/myMixin';
export default {
    name:"RegisterStep2",
    mixins:[myMinix],
    props:['mobile'],
    data()
    {
        return {
            brand_name:'',
            brand_error:false,
            fname_error:false,
            province_error:false,
            lname_error:false,
            city_error:false,
            fname:'',
            lname:'',
            ProvinceList:[],
            CityList:[],
            province_id:'',
            city_id:'',
            account_type:1,
            send_form:false
        }
    },
    mounted(){
        
        this.getProvince();
    },
    methods:{
        send_data:function(){
         
         const check_brand_name=this.validate_field('نام تجاری',this.brand_name,'brand_error',3);
            const check_fname=this.validate_field('نام',this.fname,'fname_error',3);
            const check_lname=this.validate_field('نام خانوادگی',this.lname,'lname_error',3);
            const check_province_id=this.validate_field('استان',this.province_id,'province_error');
            const check_city_id=this.validate_field('شهر',this.city_id,'city_error');

            if(check_brand_name && check_fname  && check_lname && check_province_id && check_city_id){
                   if(!this.send_form){
                    this.$emit('setServerError',false);
                    this.send_form=true;
                   
                    const form_data=new FormData();
                    form_data.append('brand_name',this.brand_name);
                    form_data.append('fname',this.fname);
                    form_data.append('lname',this.lname);
                    form_data.append('province_id',this.province_id);
                    form_data.append('city_id',this.city_id);
                    form_data.append('mobile',this.mobile);
                    form_data.append('account_type',this.account_type);

                     this.axios.post(this.$siteUrl+'/api/seller/second_step_register',form_data).then(response=>{
                if(response.data.status=='error')
                        {
                            this.send_form=false;
                           
                             this.$emit('setServerError',response.data.message);
                        }
                        else{
                            this.$emit('set_step',response.data.step);
                            this.$emit('set_type',this.account_type);
                        }
                         }).catch(()=>{
                        this.send_form=false;
                        this.$emit('setServerError','خطا در ارسال اطلاعات - مجددا تلاش نمایید');
                    });

                 }
            }
        },
       
          validate_field:function (label,field_name,field_error,field_length){

            if (field_name.toString().trim().length == 0) {
                const text = 'لطفا ' + label + ' خود را وارد نمایید';
                this[field_error] = text;
                return false;
            }
            else if (field_length != undefined && field_name.trim().length < field_length) {
                const text = '' + label + ' باید حداقل شامل ' + field_length + ' کاراکتر باشد';
                this[field_error] = text;
                return false;
            }
            else {
                this[field_error] = false;
                return true;
            }
        }
    }
 }
 </script>
      