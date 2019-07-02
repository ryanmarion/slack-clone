import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';


var firebaseConfig = {
    apiKey: "AIzaSyDHiPGQCyynGNzdthDTgBUBPpRKRxt5dUs",
    authDomain: "slack-clone-rmarion.firebaseapp.com",
    databaseURL: "https://slack-clone-rmarion.firebaseio.com",
    projectId: "slack-clone-rmarion",
    storageBucket: "slack-clone-rmarion.appspot.com",
    messagingSenderId: "335050856965",
    appId: "1:335050856965:web:d8a03b3ea8b61ec5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
