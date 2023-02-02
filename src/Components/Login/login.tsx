import React from "react";
import './login.css'
import './tooltip.css'

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import image from '../../assets/img/montains/img6.png'
import api from '../../api/post'
import ReCAPTCHA from "react-google-recaptcha";
import { Toast } from 'primereact/toast';
import { validName, validPassword } from "../Regex/Regex";


export default class Login extends React.Component {

    public state : any;
    public dataU !: [];
    public showResponse : any;
    public toast : any;
    public inscriptionModal : any;
    constructor(props : any) {
      super(props)
    
      this.state = {
         username : '',
         password : '',
         newUsername : '',
         newPassword : '',
         loading1 : false,
         stateUser : false,
         recaptchaValue : false
      }

    }

    onLoadingClick1 = ()=> {
        this.setState({ loading1: true });
        setTimeout(() => {
            this.setState({ loading1: false });
        }, 2000);
    }

    showSuccessSingUp() {
        this.toast.show({severity:'success', summary: 'Succès', detail:'Votre compte à été bien créer', life: 3000});
    }

    showSuccessSingIn(){
        this.toast.show({severity:'success', summary: 'Succès', detail:'Connexion réussi!', life: 3000})
    }

    showErrorSignUp() {
        this.toast.show({severity:'error', summary: 'Erreur', detail:'Veuillez respecter les conditions de chacune des champs', life: 3000});
    }

    showErrorSingIn(){
        this.toast.show({severity:'error', summary: 'Erreur', detail:'Mot de passe ou nom d\'utilisateur incorrecte', life: 3000});
    }

    showError () {
        this.toast.show({severity:'error', summary: 'Erreur', detail:'Une erreur s\'est produite veuillez ressayer', life: 3000});
    }

    validator = ()=>{
        const {newUsername, newPassword,recaptchaValue} = this.state
        if (validName.test(newUsername) && validPassword.test(newPassword) && recaptchaValue) {
            this.addUser(newUsername, newPassword);
        }
        else {
            this.showErrorSignUp()
        }
    } 

    componentDidMount() { 
        const script = document.createElement("script");

        script.src = "https://www.google.com/recaptcha/api.js";
        script.async = true;
        script.defer = true;

        document.body.appendChild(script);
    }

    render(): React.ReactNode {
        const {newUsername, newPassword, recaptchaValue} = this.state
        return(
            <div className="coverLogin">
                <div className="img">
                    <img src={image} alt="" />
                    <div className="logo">
                        <h1>E-zatra</h1><span className="club">Hanoratra</span>
                    </div>
                </div>
                <div className="login">
                    <div ref={(e : any)=> this.inscriptionModal = e} className="inscriptionModal">
                        <div className="newCompte">
                            <Button icon="pi pi-times" onClick={()=>{
                                this.inscriptionModal.classList.remove('showModal')
                            }} />
                        </div>
                        <h2>Inscription</h2>
                        <span className="p-float-label in">
                            <InputText id="newUsername" 
                                onChange={(e) => this.setState({newUsername: e.target.value})} 
                                tooltip="Le nom d'utilisateur doit comporter 4 à 20 caractères que ce soit lettre ou chiffre"
                                tooltipOptions={{position: 'bottom'}}
                            />
                            <label htmlFor="newUsername">Nom d'utilisateur</label>
                        </span>
                        <span className="in">
                            <Password id="newPasseword"
                                onChange={(e) => this.setState({ newPassword: e.target.value })} 
                                toggleMask 
                                tooltip="Le mot de passe doit comporter au moins 8 caractères dont une lettre majuscule, une lettre minuscule, un chiffre et un caractère spéciaux "
                                tooltipOptions={{position: 'bottom'}}
                            />
                        </span>
                        <div className="card">
                            <ReCAPTCHA
                                sitekey="6Le99LojAAAAADcUsNt1qh5Pk7Hm8GVBLjteArWN"
                                onChange={(value : any)=> {
                                    this.setState({
                                        recaptchaValue : true
                                    })
                                }}
                            />
                        </div>
                        <span className="but">
                            <Button label="Créer" icon="pi pi-send" iconPos="right" 
                                onClick={async()=>{
                                    this.validator()
                                }}
                            />
                        </span>
                    </div>
                    <div className="newCompte">
                        <Button icon="pi pi-user-plus" onClick={()=>{
                            this.inscriptionModal.classList.add('showModal')
                        }} />
                    </div>
                    <h2>Connexion</h2>
                    <span className="p-float-label in">
                        <InputText id="username" value={this.state.username} onChange={(e) => this.setState({username: e.target.value})} required />
                        <label htmlFor="username">Nom d'utilisateur</label>
                    </span>
                    <span className="in">
                        <Password id="password" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} toggleMask required/>
                    </span>
                    <span className="but">
                        <Button label="Suivant" icon="pi pi-sign-in" iconPos="right" 
                            loading={this.state.loading1}
                            onClick={()=>{
                                this.onLoadingClick1();
                                this.connexion();
                            }}
                        />
                    </span>
                </div>
                <Toast ref={(e : any)=>this.toast = e} />
            </div>
        )
    }

    connexion = async()=> {
        const {username,password } = this.state
        try {
            await api.post('/users/login', {nom : username, mdp : password})
                .then((data : any)=> {
                    localStorage.setItem('token', JSON.stringify(data.data.token));
                    localStorage.setItem('userId', JSON.stringify(data.data.userId));
                    window.location.href = (`/typing/`)
                })
                .catch((error : any)=>{
                    console.log(error)
                }) 
            
        } catch (error) {
            this.showError()
        }
    }

    addUser = async (nom : string, mdp : any)=> {
        const user = 
        {
            nom : nom,
            mdp : mdp
        }
        try {
            await api.post('/users', user);
            this.setState({
                newUsername : '',
                newPassword : ''
            })
            setTimeout(() => {
                window.location.replace('/')
            }, 3000);
            this.showSuccessSingUp()

        } catch (error) {
            this.showErrorSignUp()
        }
    }
}