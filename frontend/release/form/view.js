"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Class = require("@singleware/class");
const DOM = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
let View = class View extends Control.Component {
    constructor() {
        super({});
        this.form = (DOM.create("form", { class: "form", name: "formulario" },
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "First name:"),
                DOM.create("br", null),
                DOM.create("input", { type: "text", placeholder: "First name", name: "firstname", id: "firstname", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Last name:"),
                DOM.create("br", null),
                DOM.create("input", { type: "text", placeholder: "Last name", name: "lastname", id: "lastname", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Username:"),
                DOM.create("br", null),
                DOM.create("input", { type: "text", placeholder: "Username", name: "username", id: "username", pattern: "[a-z-0-9]+", minlength: "6", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Email:"),
                DOM.create("br", null),
                DOM.create("input", { type: "email", placeholder: "Email @juridoc.com.br", name: "email", id: "email", pattern: "[a-z0-9._%+-]+@juridoc.com.br$" })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Phone:"),
                DOM.create("br", null),
                DOM.create("input", { type: "tel", placeholder: "Phone xx xxxx-xxxx", name: "fone", id: "fone", pattern: "[0-9]{2}[\\s][0-9]{4}-[0-9]{4}" })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Password:"),
                DOM.create("br", null),
                DOM.create("input", { type: "password", placeholder: "Password", minlength: "6", name: "password", id: "password", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Confirm Password:"),
                DOM.create("br", null),
                DOM.create("input", { type: "password", required: true, placeholder: "Confirm Password", minlength: "6", id: "confirm_password" })),
            DOM.create("button", { type: "submit" }, "Submit form")));
        this.skeleton = (DOM.create("div", { class: "panel" },
            DOM.create("img", { src: "/images/logo-colorful.png", width: "200", height: "80" }),
            this.form));
        this.form.addEventListener('submit', Class.bindCallback(this.submitHandler));
    }
    submitHandler(event) {
        var firstname = document.getElementById('firstname');
        var lastname = document.getElementById('lastname');
        var username = document.getElementById('username');
        var email = document.getElementById('email');
        var fone = document.getElementById('fone');
        var password = document.getElementById('password');
        var confirm_password = document.getElementById('confirm_password');
        if (password.value != confirm_password.value) {
            event.preventDefault();
            alert('Senhas diferentes!');
        }
        else {
            var htmlvalues = {
                "firstName": firstname.value,
                "lastName": lastname.value,
                "phone": fone.value,
                "email": email.value,
                "username": username.value,
                "password": password.value
            };
            var json = JSON.stringify(htmlvalues);
            console.log(json);
            fetch('https://test.juridoc.com.br/register/', {
                method: 'POST',
                body: json
            }).then(function (data) {
                console.log('Request success: ', data);
            }).catch(function (error) {
                console.log('Request failure: ', error);
            });
            event.preventDefault();
        }
    }
    get element() {
        return this.skeleton;
    }
};
__decorate([
    Class.Private()
], View.prototype, "submitHandler", null);
__decorate([
    Class.Private()
], View.prototype, "form", void 0);
__decorate([
    Class.Private()
], View.prototype, "skeleton", void 0);
__decorate([
    Class.Public()
], View.prototype, "element", null);
View = __decorate([
    Class.Describe()
], View);
exports.View = View;
