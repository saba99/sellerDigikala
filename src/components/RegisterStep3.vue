<template>
  <div>
  <div class="account_title">کد ارسال شده به شماره موبایل {{ mobile}} را وارد نمایید.</div>
    <div class="number_input_div">
      <input
        type="text"
        name="active_code"
        max="6"
        v-model="code"
        class="number_input number"
        maxlength="6"
      />
    </div>
    <div class="line_box">
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>
      <p v-if="code_error" class="has_error">{{ code_error }}</p>
    <p v-on:click="resend_active_code()" class="timer">
      <span>ارسال مجدد کد</span>
      <span style="padding-right:5px">{{ show_time }}</span>
    </p>
    <div class="form-group btn_div" style="margin-top:20px">
      <button class="btn btn-success" v-on:click="send_code()">تایید</button>
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
 import myMixin from "../assets/myMixin";
 export default{

   name: "RegisterStep3",
  props: ["mobile"],
  mixins: [myMixin],
 data() {
    return {
      code: "",
      t: 180,
      timer: null,
      show_time: "",
      send_form: false,
      code_error: false
    };
  },
mounted(){
    this.startTimer();
},
methods:{
    
    startTimer:function(){
        const app=this;
        this.timer=setInterval(function(){
         app.t=app.t-1;
        let m=Math.floor(app.t/60);
        let s=app.t-m+60;
        if(s.toString().length==1){
            s="0"+s;
        }
        let text=app.replaceNumber("0"+m)+":"+app.replaceNumber(s);
        if(app.t==0){
clearInterval(this.timer);
app.show_time='';
app.t=180;
app.timer=null;
        }
        app.show_time=text;   
 
        },1000);
    },
     resend_active_code:function(){

         if(this.t==0){

           this.send_form = true;
        const form_data = new FormData();
        form_data.append("mobile", this.mobile);
          this.axios
          .post(this.$siteUrl + "/api/seller/resend_active_code", form_data)
          .then(response => {
            this.send_form = false;
            if (response.data.status == "error") {
              this.$emit("setServerError", response.data.message);
            } else {
              this.t = 180;
              this.startTimer();
            }
          })
          .catch(() => {
            this.send_form = false;
            this.$emit(
              "setServerError",
              "خطا در ارسال اطلاعات - مجددا تلاش نمایید"
            );
          });
      
         }
     },
     send_code:function(){
        
        const validate_code = this.validate_field(
        "کد تایید",
        this.code,
        "code_error",
        6
      );
      if(validate_code && !this.send_form){
        
        this.send_form = true;
        const form_data = new FormData();
        form_data.append("mobile", this.mobile);
        form_data.append("code", this.code);
        this.axios
          .post(this.$siteUrl + "/api/seller/check_active_code", form_data)
          .then(response => {
            this.send_form = false;
            if (response.data.status == "error") {
              this.$emit("setServerError", response.data.message);
            } else {
              this.$emit("set_step", 3);
            }
          })
          .catch(() => {
            this.send_form = false;
            this.$emit(
              "setServerError",
              "خطا در ارسال اطلاعات - مجددا تلاش نمایید"
            );
          });  
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
},
 

    }
      </script>
      