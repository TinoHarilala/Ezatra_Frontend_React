import React, {KeyboardEvent} from 'react';
import './typingClub.css';
import './steps.css';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { Toast } from 'primereact/toast';
import clavier from '../../assets/img/demo.png'
import api from '../../api/post'

export default class TypingClub extends React.Component {

    public state : any;
    public puzzle : any;
    public inputActivated : any;
    public toast : any;
   
    constructor(props : any) {
      super(props)
    
      this.state = {
         datalvl : [],
         dataScore : [],
         data : '',
         indice : 0,
         idLvl : 0,
         erreur : 0,
         success : 1,
         precision : 0,
         timer : 0,
         progress : 0,
         exercice : 1,
         characters : '',
         length : 0,
         score : 0,
         currentIdLvl : 1,
         currnetUserId : 0,
         meilleurScore : 0,
         visibleContent : false,
         infoModal : false,
         parametreModal : false,
         loading1 : false,
         loading2 : false,
         activeIndex : 0,
         user : '',
         fin : false
      }
    }

    // onLoading Click
    onLoadingClick2 = ()=> {
        this.setState({ loading2 : true });
        setTimeout(() => {
            this.setState({ loading2: false , infoModal : false});
            this.timer()
        }, 3000);
    }

    onLoadingClick1 = ()=> {
        this.setState({ loading1: true });
        setTimeout(() => {
            this.setState({ loading1: false });
        }, 2000);
    }

    // Générer automatiquement les lettres

    getOneExercice = (id : number)=> {
        const token = JSON.parse(localStorage.getItem('token')!) 
        const fetchPostLevel = async ()=> {
            try {
                await  api.post('/levels/getByPk', {"id" : id})
                .then((resp : any)=> {
                    this.buildRadomLetter(resp.data)
                    this.inputActivated.focus();
                    this.timer()
                })
            } catch (error : any) {
                console.log(error.message)
            }
        }
        fetchPostLevel()
    }

    randomLetter = (length : number, characters : string) => {
        let result =''
        let charactersLength = characters.length;

        for ( let i = 0; i < length; i++ ) {
            do {
                var random  = characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            while ((i === 0 && random === ' ') || 
                (i === length-1 && random === ' ') || 
                (i > 0 && random === ' '&& result.charAt(i - 1) === ' ')
            );
            result += random;
        }
        
        this.setState({data : result})

    }

    
    buildRadomLetter = async (data : any)=> {
       await data.map((elm : any)=> {
            if (elm.exercice === this.state.exercice) {
                this.setState({
                    characters : elm.characters,
                    length : elm.length,
                    idLvl : elm.id
                })
                this.randomLetter(elm.length, elm.characters)
            }
        })
    }

    getDataLevel = async ()=>{
        const token = JSON.parse(localStorage.getItem('token')!) 
        await api.get('/levels')
            .then((data : any)=> {
                this.setState({
                    datalvl : data.data
                })
            })
    }

    getMeilleurScore = async (user : number, level : number)=>{
        await api.post('/scores/higher', {
            iduser : user,
            idlvl : level
        })
            .then((data : any)=>{
                this.setState({
                    meilleurScore : data.data.point
                })
            })
    }

    componentDidMount() { 
        this.getDataLevel();
        this.setState({
            parametreModal : true,
            currnetUserId : JSON.parse(localStorage.getItem('userId')!)
        })    

    } 
     
     
    render(): React.ReactNode {
        const {data, indice, erreur,precision, timer, progress, exercice, length,score,currnetUserId, idLvl} = this.state
        const scoreToString = this.state.score.toString()
        const CheckAnswer = (e: KeyboardEvent) => {

            if(data.charAt(indice) === e.key) {
                this.setState({indice : indice + 1})
                this.setState({success : this.state.success + 1})
                this.progress()
                this.score()
                this.precision()
                if ( indice +1  === length ) {
                    this.setState( {visibleContent : true} );
                    this.getMeilleurScore(currnetUserId, idLvl)
                    this.addScore();
                }
                if (indice +1 === 45) {
                    this.puzzle.classList.add('translateToTop');
                }
            }

            else
            {
                this.erreur()
                this.precision() 
                this.score()
            }
        }
        const getItems = this.state.datalvl.map((elm : any)=> {
            return (
                {
                    label: `Exercice ${elm.exercice}`,
                    command: (event : any) => {
                        this.setState({
                            infoModal : true,
                            characters : elm.characters,
                            exercice : elm.exercice,
                            length : elm.length,
                            idLvl : elm.id,
                            erreur : 0,
                            indice : 0,
                            precision : 0,
                            progress : 0,
                            timer : 0,
                            score : 0
                        })
                        this.randomLetter(elm.length, elm.characters)
                    }
                }
            )
        })

        return(
            <div className="typing">
                <div className="wrap"  onClick={()=>this.inputActivated.focus()}>
                    <div className="headerTyping">
                        <div className="title">
                            <h1>E-zatra <span>Hanoratra</span></h1>
                        </div>
                        <div className="config">
                            <Button  icon="pi pi-cog" 
                                onClick={()=>{
                                    this.setState({
                                        parametreModal : true
                                    })
                                }}
                            />
                            <Button  label="Déconnection" icon="pi pi-sign-out" iconPos="right"
                                onClick={()=> {
                                    this.deconnexion()
                                }}
                            />
                        </div>
                    </div> 
                    <div className="content">
                        <div className="translate">
                            <div ref={(e : any)=>this.puzzle = e} className="puzzle">
                                {this.setLetter()}
                            </div>
                        </div>
                        <div className="result">
                            <p>Exercice</p>
                            <span>{exercice}</span><br />
                            <p>Précison</p>
                            <span>{precision}%</span><br />
                            <p>Erreur</p>
                            <span>{erreur}</span><br />
                            <p>Temps</p>
                            <span>{timer} s</span>
                            <p>Progression</p>
                            <div className="coverProgress">
                                <div className="Progress" style={{width : `${progress}%`, marginTop : '40px'}}>
                                </div>
                            </div>
                            <br />
                            <p>Score</p>
                            <span>{score} </span>
                        </div>
                    </div>
                    <div className="footer">
                        <input 
                            className='hidden'
                            type="text" 
                            onKeyUp={CheckAnswer} 
                            ref={(input) => { this.inputActivated = input; }} 
                        />
                    </div>
                    <Dialog header="Résultat" visible={this.state.visibleContent} className='ModalIsFinished' onHide={() => this.setState({visibleContent :false})}>
                        {this.ifMeilleurScore()}
                        <div className="detail">
                            <span>{precision}</span>
                            <span>{erreur}</span>
                            <span>{timer}</span>
                        </div>
                        <div className="record">
                            <h1>Votre score</h1>
                            <span>{this.affichageScore(scoreToString)} points</span>
                        </div>
                        <div className="dialog-footer">
                            <Button label="Recommencer" icon="pi pi-replay" loading={this.state.loading1}  iconPos="right" 
                                onClick={()=>{
                                    this.onLoadingClick1();
                                    this.puzzle.classList.remove('translateToTop');
                                    this.recommencer()
                                }}
                            />
                            <Button label="Suivant" icon="pi pi-forward" iconPos="right" 
                                onClick={()=>{
                                    this.puzzle.classList.remove('translateToTop');
                                    this.suivant()
                                }}
                            />
                        </div>
                    </Dialog>
                    
                    <Dialog header="Information" visible={this.state.infoModal} className='information' onHide={() => this.setState({infoModal :false})}>
                        <h3>Vous êtes maintenant à l'exercice {exercice}</h3>
                        <div className="listeTouche">
                            {this.setTouche()}
                        </div>
                        <div className="imgClavier">
                            <img src={clavier} alt="" />
                        </div>
                        <div className="butFooter">
                            <Button label="Prêt" loading={this.state.loading2} 
                            onClick={()=> {
                                this.onLoadingClick2();
                                this.setState({
                                    parametreModal : false
                                });
                               
                                }
                            }
                             />
                        </div>
                    </Dialog>

                    <Dialog header="Paramètre" visible={this.state.parametreModal} className='parametre' onHide={() => this.setState({parametreModal :false})}>
                        <Toast ref={(el : any) => { this.toast = el }}></Toast>
                        <Steps model={getItems} activeIndex={this.state.exercice - 1} onSelect={(e : any) => this.setState({ activeIndex: e.index })} readOnly={false} />
                    </Dialog>
                </div>
            </div>
        )
    }

    setLetter = ()=> {
        const {data, indice} = this.state
        return(data.split('').map((lettre : string , index : number)=> {
            if (indice === index + 1) {
                return (
                        <div className='lettre check' key={index}>
                            <span>{lettre}</span>
                        </div>
                    )
            }
            else if (index +1 < indice) {
                return (
                    <div className='lettre check' key={index}>
                        <span>{lettre}</span>
                    </div>
                )
            }
            else {
                return(
                
                    <div className='lettre' key={index}>
                            <span>{lettre}</span>
                    </div>
                )
            }
            
        })) 
    }
 
    setTouche = ()=> {
        const { characters }= this.state
        return(
            characters.split('').map((lettre : string, index : number)=> {
                return(
                    <span key={index}>{lettre.toUpperCase()}</span>
                )
            })
        )
    }

    erreur = ()=> {
        const { erreur } = this.state
        this.setState({erreur : erreur +1 })
    }

    precision = ()=> {
        const {length,erreur, success} = this.state
        this.setState({
            precision : Math.round(((success - erreur) / length) *100)
        }) 
    }

    timer = ()=>{
        let count = 0
        let counter = setInterval(() => {
            if( (this.state.visibleContent === true) || (this.state.parametreModal === true)) {
                clearInterval(counter);
                
            }
            count ++ 
            this.setState({
                timer : count
            })
        }, 1000);
    } 

    progress = ()=> {
        const {indice, length} = this.state
        this.setState({
            progress : indice * 100 / length
        })
    }

    score = ()=> {
        const {precision,timer, erreur} = this.state
        let res = Math.round(((precision - erreur)*100 / timer))
        if (res < 0)
            res = 0
        this.setState({
            score : res
        })
    }

    affichageScore = (txt : string)=> {
        let long = txt.length
        let res = '';
        let pointer = long;
        let j = 1;
        if(long > 3){
            for (let i = 0; i <= long / 3; i++) {
                res =  txt.substring(pointer-3,pointer +1/j) + ' ' + res;
                pointer = pointer - 3;
                j ++;
            }
            return (<span>{res}</span>)
        }
        else{
            return(<span>{txt}</span>)
        }
    }

    recommencer = ()=> {
        setTimeout(() => {
            this.setState({
                erreur : 0,
                indice : 0,
                precision : 0,
                progress : 0,
                timer : 0,
                success : 1,
                score : 0,
                visibleContent : false
            });
            this.timer()
        }, 2000);
    }

    suivant = ()=>{
        const nextLvl = this.state.exercice + 1;
        this.state.datalvl.map((elm : any)=> {
            if (elm.exercice === nextLvl ) {
                this.setState({
                    exercice : nextLvl,
                    characters : elm.characters,
                    length : elm.length,
                    erreur : 0,
                    indice : 0,
                    precision : 0,
                    progress : 0,
                    timer : 0,
                    score : 0,
                    success : 1,
                    visibleContent : false,
                    infoModal : true

                })
                this.randomLetter(elm.length, elm.characters);
            }
        })
    }

    deconnexion = ()=>{
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            window.location.replace('/');
    }

    setMeilleurScore = ()=> {
        const userId = JSON.parse(localStorage.getItem('userId')!);
        const {dataScore} = this.state
        dataScore.map((elm : any)=> {
            if (elm.idUser === userId)
            this.setState({
                meilleurScore : elm.Meilleurscore
            })
        })
    }

    ifMeilleurScore = ()=> {
        const {score, meilleurScore} = this.state
        
        if (score > meilleurScore) {
            return(
                <h1 className='MS newrecord'>Nouveau record : {score}</h1>
            )
        }
        else {
            return(
                <h1 className='MS'>Meilleure Score : {meilleurScore}</h1>
            )
        }


    }

    getDataScore = ()=> {
        const fecthDataScore = async ()=> {
            await api.get('/scores').then((resp : any)=> {
                this.setState({
                    dataScore : resp.data
                })
            })
        }
        fecthDataScore()
    }

    addScore = async ()=> {
       const {timer , precision , erreur, score, idLvl,meilleurScore, dataScore} = this.state
        const userId = JSON.parse(localStorage.getItem('userId')!)
        const token = JSON.parse(localStorage.getItem('token')!)
        
        const scr = {
            "timer" : timer,
            "precision" : precision,
            "erreur" : erreur,
            "score" : score,
            "user" : userId,
            "level" : idLvl
        }

        try {
            await api.post('/scores', scr);
            this.getDataScore()
        } catch (error : any) {
            console.log(`Error: ${error.message}`)
        }
    }
}