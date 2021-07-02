<template>
  <div>
    <loading v-if="showLoading"></loading>
    <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
    <account-status :account_status="account_status"></account-status>
    <div class="panel">
      <div class="header">ویرایش پروفایل</div>
      <div class="panel_content">
        <div>
          <div v-if="show_alert_message" style="margin-bottom:30px" class="alert alert-success alert-dismissible fade show" role="alert">
              <span>{{ alert_message }}</span>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
          </div>
           <div v-if="errors.length>0" class="alert alert-warning">
              <ul class="errors_ul">
                  <li :key="key" v-for="(error,key) in errors">{{ error[0] }}</li>
              </ul>
            </div>
          <div v-if="encrypted==''">
           
            <div class="form-group">
              <label>نام :</label>
              <input type="text" v-model="fname" class="form-control" />
              <span class="has_error" v-if="fname_error">{{ fname_error }}</span>
            </div>
 
            <div class="form-group">
              <label>نام خانوادگی :</label>
              <input type="text" v-model="lname" class="form-control" />
              <span class="has_error" v-if="lname_error">{{ lname_error }}</span>
            </div>

            <div class="form-group">
              <label>نام فروشگاه :</label>
              <input type="text" v-model="brand_name" class="form-control" />
              <span class="has_error" v-if="brand_name_error">{{ brand_name_error }}</span>
            </div>

            <div class="form-group">
              <label>ایمیل :</label>
              <input type="text" v-model="email" class="form-control left" />
              <span class="has_error" v-if="email_error">{{ email_error }}</span>
            </div>

            <div class="form-group">
              <label>شماره موبایل :</label>
              <input type="text" v-model="mobile" class="form-control left" />
              <span class="has_error" v-if="mobile_error">{{ mobile_error }}</span>
            </div>

            <div class="form-group">
              <label>کلمه عبور :</label>
              <input type="password" v-model="password" class="form-control" />
              <span class="has_error" v-if="password_error">{{ password_error }}</span>
            </div>

            <div class="form-group">
              <label>شماره شبا :</label>
              <input type="text" v-model="shaba" class="form-control left" />
              <span class="has_error" v-if="shaba_error">{{ shaba_error }}</span>
            </div>

            <div class="form-group" style="display:flex">
              <label></label>
              <div>
                <select
                v-on:change="getCity"
                v-model="province_id"
                ref="province_id"
                class="selecthalf auto_width"
                >
                  <option value="">انتخاب استان</option>
                  <option :value="item.id" v-for="item in provinceList" :key="item.iid">{{ item.name}}</option>
                </select>
                <br><span class="has_error" style="padding-right:0px" v-if="province_error">{{ province_error }}</span>
              </div>

              <div style="margin-right:20px">
                <select v-model="city_id" ref="city_id" class="selecthalf auto_width">
                  <option value="">انتخاب شهر</option>
                  <option :value="item.id" v-for="item in cityList" :key="item.iid">{{ item.name}}</option>
                </select><br>
                <span class="has_error" style="padding-right:0px" v-if="city_error">{{ city_error }}</span>
              </div>
            </div>

            <div v-if="account_status=='reject'" class="seller_file_div">
              <div class="form-group">
                <label>انتخاب اسکن صفحه اصلی شناسنامه</label>
                <input type="file" ref="file_input1" v-on:change="set_file(1)" />
                <div class="select_file_div" v-on:click="$refs.file_input1.click()">
                  <div class="title">انتخاب فایل</div>
                  <div class="file_name">{{ this.file1_name }}</div>
                </div>
              </div>
              <div class="form-group">
                <label>انتخاب اسکن کارت ملی</label>
                <input type="file" ref="file_input2" v-on:change="set_file(2)" />
                <div class="select_file_div" v-on:click="$refs.file_input2.click()">
                  <div class="title">انتخاب فایل</div>
                  <div class="file_name">{{ this.file2_name }}</div>
                </div>
              </div>
              <div class="form-group" v-if="account_type==2">
                <label>انتخاب اسکن روزنامه رسمی</label>
                <input type="file" ref="file_input3" v-on:change="set_file(3)" />
                <div class="select_file_div" v-on:click="$refs.file_input3.click()">
                  <div class="title">انتخاب فایل</div>
                  <div class="file_name">{{ this.file3_name }}</div>
                </div>
              </div>
            </div>
            <button class="btn btn-success" v-on:click="send_data()">ثبت اطلاعات</button>
          </div>
          <div v-else>
            <div class="account_title">کد ارسال شده به شماره موبایل {{ mobile}} را وارد نمایید.</div>
            <div class="number_input_div">
               <input type="text" name="active_code" max="6" v-model="code" class="number_input number" maxlength="6"/>
            </div>
           <div class="line_box">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <p v-on:click="resend_active_code()" class="timer" style="text-align: center;">
              <span>ارسال مجدد کد</span>
              <span style="padding-right:5px">{{ show_time }}</span>
            </p>
            <div class="form-group btn_div" style="margin-top:20px">
               <button class="btn btn-success" v-on:click="send_code()">تایید</button>
            </div>
          </div>

        </div>
      </div>
    </div>
    <server-error-message v-if="server_error"></server-error-message>
  </div>
</template>

<script>
import myMinix from "../assets/myMixin";
export default {
  mixins: [myMinix],
  data() {
    return {
      showLoading: false,
      server_error: false,
      account_status: "active",
      BreadcrumbList: [{ path: "/setting/profile", title: "ویرایش پروفایل" }],
      brand_name: "",
      email: "",
      fname: "",
      lname: "",
      mobile: "",
      provinceList: [],
      province_id: 0,
      city_id: 0,
      cityList: [],
      shaba: "",
      password: "",
      fname_error: false,
      lname_error: false,
      brand_name_error: false,
      mobile_error: false,
      email_error: false,
      password_error: false,
      shaba_error: false,
      province_error:false,
      city_error:false,
      account_type: 1,
      file1_name: "",
      file2_name: "",
      file3_name: "",
      send_form: false,
      file1: null,
      file2: null,
      file3: null,
      errors:[],
      show_alert_message:false,
      alert_message:'',
      encrypted:'',
      code:'',
      t: 180,
      timer: null,
      show_time: "",
      send_resend_code:true
    };
  },
  mounted() {
    this.account_status = localStorage.getItem("account_status");
    this.$emit("setSideBarItem", "setting");
    this.getData();
  },
  methods: {
    getData: function() {
      this.showLoading = true;
      const url = this.$siteUrl + "/api/seller/profile";
      this.axios
        .get(url, this.setHeader())
        .then(response => {
          this.showLoading = false;
          this.brand_name = response.data.seller.brand_name;
          this.email = response.data.seller.email;
          this.fname = response.data.seller.fname;
          this.lname = response.data.seller.lname;
          this.mobile = response.data.seller.mobile;
          this.province_id = response.data.seller.province_id;
          this.city_id = response.data.seller.city_id;
          this.shaba = response.data.seller.shaba;
          this.provinceList = response.data.province;
          this.account_status = response.data.seller.account_status;
          this.account_type = response.data.seller.account_type;
        //   const app = this;
          this.getCity();
        //   this.$nextTick(function() {
        //     /* global $ */
        //     $(app.$refs.province_id).selectpicker("refresh");
        //   });
        })
        .catch(error => {
          this.setCatch(error);
        });
    },
    getCity: function() {
      if (this.province_id != 0) {
        const url = this.$siteUrl + "/api/get_city/" + this.province_id;
        this.axios.get(url).then(response => {
          this.cityList = response.data;
        //   const app = this;
        //   this.$nextTick(function() {
        //     $(app.$refs.city_id).selectpicker("refresh");
        //   });
        });
      }
    },
    set_file: function(n) {
      const name = "file" + n;
      const file_input_name = "file_input" + n;
      this[name] = this.$refs[file_input_name].files[0];
      this["file" + n + "_name"] = this[name].name;
    },
    send_data: function() {
      const check_name = this.validate_field("نام ",this.fname,"fname_error",3);
      const check_lname = this.validate_field("نام خانوادگی",this.lname,"lname_error",3);
      const check_brand_name = this.validate_field("نام فروشگاه",this.brand_name,"brand_name_error",2);
      const check_city = this.validate_field("شهر",this.city_id,"city_error");
      const check_province = this.validate_field("استان",this.province_id,"province_error");
      const check_email = this.validate_email();
      const check_mobile = this.validate_mobile();
      let check_password = true;
      if(this.password.trim() != "") {
        check_password = this.validate_password(6);
      } 
      else 
      {
        this.password_error = false;
      }
      if(check_name && check_lname && check_brand_name && check_email && check_mobile && check_password && check_city && check_province)
      {
         this.errors=[];
         this.showLoading=true;
         const formData=new FormData();
         const shaba=this.shaba==null ? '' : this.shaba;
         formData.append('fname',this.fname);
         formData.append('lname',this.lname);
         formData.append('brand_name',this.brand_name);
         formData.append('email',this.email);
         formData.append('mobile_number',this.mobile);
         formData.append('password',this.password);
         formData.append('city_id',this.city_id);
         formData.append('province_id',this.province_id);
         formData.append('shaba',shaba);
         if(this.file1!=null){
            formData.append('shenasname',this.file1);
         }
         if(this.file2!=null){
            formData.append('cart',this.file2);
         }
         if(this.file3!=null){
            formData.append('rooznamepic',this.file3);
         }

         const url=this.$siteUrl+'/api/seller/profle/edit';
         this.axios.post(url,formData,this.setHeader('image')).then(response=>{
             this.showLoading=false;
             if(response.data.status=="error")
             {
                const errors=response.data.errors;
                const keys=Object.keys(errors);
                for(var i=0;i<keys.length;i++)
                {
                    this.errors.push(errors[keys[i]]);
                }
             }
             else if(response.data.status=="server_error"){
                this.show_server_error();
             }
             else if(response.data.status=="ok"){
                this.file1_name="";
                this.file2_name="";
                this.file3_name="";
                this.file1=null;
                this.file2=null;
                this.file3=null;
                this.show_alert_message=true;
                this.alert_message='ثبت اطلاعات با موفقیت انجام شد';

                localStorage.setItem('account_status', response.data.seller.account_status);
                localStorage.setItem('brand_name', response.data.seller.brand_name);
                this.$emit('updateInfo');
             }
             else if(response.data.status=="active_mobile"){
                this.encrypted=response.data.encrypted;
                this.startTimer();

                localStorage.setItem('account_status', response.data.seller.account_status);
                localStorage.setItem('brand_name', response.data.seller.brand_name);
                this.$emit('updateInfo');
             }
         }).catch((error) => {
            this.setCatch(error);
         });
      }
    },
    send_code:function(){
      this.showLoading=true;
      const url=this.$siteUrl+'/api/seller/profile_check_active_code';
      const formData=new FormData();
      formData.append('code',this.code);
      formData.append('encrypted',this.encrypted);
      this.axios.post(url,formData,this.setHeader()).then(response=>{
        this.showLoading=false;
       
        if(response.data=="ok")
        {
           this.encrypted='';
           this.show_alert_message=true;
           this.alert_message='ثبت اطلاعات با موفقیت انجام شد';
        //    const app=this;
           this.errors=[];
        //    this.$nextTick(function() {
        //     $(app.$refs.province_id).selectpicker("refresh");
        //     $(app.$refs.city_id).selectpicker("refresh");
        //   });
        }
        else{
          this.errors.push(['کد فعال سازی وارد شده معتبر نمی باشد']);
        }
      }).catch((error) => {
        this.setCatch(error);
      });
    },
    resend_active_code: function() {
      if (this.t == 0 && this.send_resend_code) {
        this.send_resend_code=false;
        const form_data = new FormData();
        this.axios
          .post(this.$siteUrl + "/api/seller/profile_resend_active_code", form_data,this.setHeader())
          .then(response => {
             this.send_resend_code=true;
            if (response.data.status == "error") {
              this.show_server_error();
            } else {
              this.t = 180;
              this.startTimer();
            }
          })
          .catch((error) => {
            this.send_resend_code=true;
            this.setCatch(error);
          });
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
        }, show_server_error: function () {
        this.server_error = true;
        const app = this;
        setTimeout(function () {
            app.server_error = false
        }, 5000);
    },validate_field:function (label,field_name,field_error,field_length){

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
        }, startTimer: function () {
        const app = this;
        this.timer = setInterval(function () {
            app.t = app.t - 1;
            let m = Math.floor(app.t / 60);
            let s = app.t - m * 60;
            if (s.toString().length == 1) {
                s = "0" + s;
            }
            let text = app.replaceNumber("0" + m) + ":" + app.replaceNumber(s);
            if (app.t == 0) {
                clearInterval(app.timer);
                app.show_time = "";
                app.timer = null;
            } else {
                app.show_time = text;
            }
        }, 1000);
    },
  }
};
</script>

<style scoped>
label{
  width: 205px !important;
}
</style>