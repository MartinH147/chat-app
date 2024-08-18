// credit to Fireship: https://www.youtube.com/watch?v=zQyrwxMPm88

import logo from './logo.svg';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlameSimple } from '@fortawesome/free-solid-svg-icons';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useCollectionDate } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

firebase.initializeApp({
  apiKey: "AIzaSyBpceLXN4G2aXQgchnTvKe2VewqjCaObYk",
  authDomain: "chat-app-33c6c.firebaseapp.com",
  projectId: "chat-app-33c6c",
  storageBucket: "chat-app-33c6c.appspot.com",
  messagingSenderId: "136333905238",
  appId: "1:136333905238:web:c34925699d3365de9c9af7"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <div className='signInBackground'>
      <h1 className='signInTitle'>Fireplace</h1>
      <button onClick={signInWithGoogle} className='signIn'>Sign in with Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className='signOut'>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef()

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })

    setFormValue('');

    dummy.current.scrollIntoView({behaviour: 'smooth'})
  }

  return(
    <div className='chat'>
      <SignOut />
      <main className='messages'>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage} className='messageForm'>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} className='messageInput'/>

        <button type='submit' className='sendMessage'>
          <FontAwesomeIcon icon={faFireFlameSimple} size='lg' inverse/>
        </button>

      </form>
    </div>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
