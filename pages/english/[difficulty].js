import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import axios from 'axios';
import React, { Component } from 'react';
import * as MyScriptJS from 'myscript';

const editorStyle = {
    'minWidth': '100px',
    'minHeight': '100px',
    'width': '100vw',
    'height': 'calc(100vh - 190px)',
};

class App extends Component {
    constructor(props) {
        
        super(props);
        this.state = ({
            difficulty: '',
            words: [],
            current: '',
            currentAns: '',
            questionNo: 0,
            // definitions: [],
            // definition: '',
            // partOfSpeech: '',
        })
    }
    render() {
        return (
            <div className="container">
                <Head>
                    <Header />
                </Head>
                <center>
                    <h1>Difficulty: {this.state.difficulty}</h1>
                    <h3>Word: {this.state.current}</h3>
                    {/* <h4>Part of Speech: {this.state.partOfSpeech}</h4>
                    <p>Definition: {this.state.definition}</p> */}
                    <button onClick={() => { this.editor.clear() }}>Clear</button>
                    <button onClick={this.checkAns}>Check</button>
                </center>

                <div style={editorStyle} ref="editor" >
                </div>
            </div>
        );
    }
    componentDidMount() {
        let loc = window.location.toString();
        loc = loc.split('/')
        console.log(loc)
        this.setState({difficulty: loc[4]})
        axios.get(`http://localhost:8080/eng/${loc[4]}`)
            .then(res => {
                let arr = [];
                let def = [];
                for (var i in res.data) {
                    arr.push(res.data[i].word)
                    // axios.get(`https://wordsapiv1.p.rapidapi.com/words/${res.data[i].word}/definitions`, {
                    //     headers: {
                    //         "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
                    //         "x-rapidapi-key": "dee7410ecemshfce7d4e41be4e08p13acd4jsn987a07e0067a"
                    //     }
                    // }).then(res => {
                    //     // console.log(def)
                    //     def.push(res.data)
                    //     this.setState({ definitions: def })
                    // })
                }
                this.setState({ words: arr })
                console.log(this.state.words)
            }).then(this.dispWord)
        this.editor = MyScriptJS.register(this.refs.editor, {
            recognitionParams: {
                type: 'TEXT',
                protocol: 'WEBSOCKET',
                apiVersion: 'V4',
                server: {
                    scheme: 'https',
                    host: 'webdemoapi.myscript.com',
                    applicationKey: '1463c06b-251c-47b8-ad0b-ba05b9a3bd01',
                    hmacKey: '60ca101a-5e6d-4159-abc5-2efcbecce059',
                },
            },
        });
        
        window.addEventListener("resize", () => { this.editor.resize() });
    }
    
    dispWord = () => {
        if (this.state.words.length !== 0) {
            let qno = this.state.questionNo;
            let word = this.state.words[qno];
            String.prototype.replaceAt = function (index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
            const index = Math.floor(Math.random() * (word.length - 1) + 1)
            this.setState({ currentAns: word.charAt(index) });
            word = word.toUpperCase().replaceAt(index, '_')
            this.setState({ current: word })
            // console.log(this.state.definitions)
            // this.setState({ definition: this.state.definitions[qno].definition})
            // this.setState({ partOfSpeech: this.state.definitions[qno].partOfSpeech})
        }
    }
    checkAns = () => {
        let input = this.editor.exports['text/plain'];
        input = input.toLowerCase()
        if (this.state.currentAns == input) {
            if (this.state.questionNo > 4) {
                alert("You finished the quiz, thanks")
            }
            else {
                this.setState({ questionNo: ++this.state.questionNo })
                this.editor.clear()
                this.dispWord()
                alert("correct ans")
            }
        }
        else {
            this.editor.clear()
            alert("try again")
        }
    }
}

export default App;