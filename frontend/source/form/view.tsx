/**
 * Copyright (C) 2018 Juridoc
 * Form page view structure.
 */
import * as Class from '@singleware/class';
import * as DOM from '@singleware/jsx';
import * as Control from '@singleware/ui-control';
import { Script } from 'vm';



/**
 * Form view class.
 */
@Class.Describe()
export class View extends Control.Component<{}> {
  /**
   * Form submit event handler.
   * @param event Event information.
   */
  @Class.Private()
  private submitHandler(event: Event): void {
    var firstname = document.getElementById('firstname') as HTMLInputElement
    var lastname = document.getElementById('lastname') as HTMLInputElement
    var username = document.getElementById('username') as HTMLInputElement
    var email = document.getElementById('email') as HTMLInputElement
    var fone = document.getElementById('fone') as HTMLInputElement
    var password = document.getElementById('password') as HTMLInputElement
    var confirm_password = document.getElementById('confirm_password') as HTMLInputElement
  
    if(password.value!=confirm_password.value){
      event.preventDefault();
      alert('Senhas diferentes!')
    }else{
      var htmlvalues={
        "firstName":firstname.value,
        "lastName":lastname.value,
        "phone":fone.value,
        "email":email.value,
        "username":username.value,
        "password":password.value
      };
      var json =JSON.stringify(htmlvalues);
      console.log(json);

      fetch('https://test.juridoc.com.br/register/', {
        method: 'POST',
        body: json
      }).then(function(data) {
        console.log('Request success: ', data); 
      }).catch(function (error) {  
        console.log('Request failure: ', error);  
      });
     /* event.preventDefault();*/
    }
  

  }

  /**
   * Form element.
   */
  @Class.Private()
  private form: HTMLFormElement = (
    <form class="form" name="formulario">
      <div class="field">
        <label>First name:</label><br/>
        <input type="text" placeholder="First name" name="firstname" id="firstname" required/>
      </div>
      <div class="field">
        <label>Last name:</label><br/>
        <input type="text" placeholder="Last name" name="lastname" id="lastname" required/>
      </div>
      <div class="field">
        <label>Username:</label><br/>
        <input type="text" placeholder="Username" name="username" id="username" pattern="[a-z-0-9]+" minlength="6" required/>
      </div>
      <div class="field">
        <label>Email:</label><br/>
        <input type="email" placeholder="Email @juridoc.com.br" name="email" id="email" pattern="[a-z0-9._%+-]+@juridoc.com.br$" />
      </div>
      <div class="field">
        <label>Phone:</label><br/>
        <input type="tel" placeholder="Phone xx xxxx-xxxx" name="fone" id="fone" pattern="[0-9]{2}[\s][0-9]{4}-[0-9]{4}"/>
      </div>
      <div class="field">
        <label>Password:</label><br/>
        <input type="password" placeholder="Password" minlength="6" name="password" id="password" required/>
      </div>
      <div class="field">
        <label>Confirm Password:</label><br/>
        <input type="password"  required placeholder="Confirm Password" minlength="6" id="confirm_password"/>
      </div>
      <button type="submit">Submit form</button>
    </form>
  ) as HTMLFormElement;

  /**
   * View element.
   */
  @Class.Private()
  private skeleton: HTMLDivElement = (
    <div class="panel">
      <img src="/images/logo-colorful.png" width="200" height="80"/>
      {this.form}
    </div>
  ) as HTMLDivElement;

  /**
   * Default constructor.
   */
  public constructor() {
    super({});
    this.form.addEventListener('submit', Class.bindCallback(this.submitHandler));
  }

  /**
   * View element.
   */
  @Class.Public()
  public get element(): HTMLElement {
    return this.skeleton;
  }
}
