import React from "react";
import ReactDOM from "react-dom/client";
import "./MHPS.css";

// import { db, auth } from "../firebase";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// import { doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    // apiKey: "AIzaSyDXi-16h6fqkvFhyh96rHPSrcUUYI-r1Lw",
    apiKey: import.meta.env.VITE_Firebase_API_Key,
    authDomain: "quad-core-a.firebaseapp.com",
    projectId: "quad-core-a",
    storageBucket: "quad-core-a.firebasestorage.app",
    messagingSenderId: "702554879008",
    appId: "1:702554879008:web:c502334c89adb58f8f3845",
    measurementId: "G-L8ZCNH62LF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export default function MedicalHistory(){
    const [conditions, setConditions] = React.useState([]); // store firebase data in default state instead of empty list
    const [allergies, setAllergies] = React.useState([]);
    const [surgeries, setSurgeries] = React.useState([]);
    const [chronics, setChronics] = React.useState([]);
    const [note, setNote] = React.useState("");

    // For Firebase user authentication
    const [user, setUser] = React.useState(null);
    const [authReady, setAuthReady] = React.useState(false);

    React.useEffect(() => {
        const unsub = auth.onAuthStateChanged(u => {
            setUser(u);
            setAuthReady(true);
        });

        return unsub;
    }, []);
    // Till here and will continue later


    const [form, setForm] = React.useState(
        {
            condition: "",
            allergy: "",
            surgery: "",
            chronic: ""
        }
    );


    // React.useEffect(() => {
    //     const loadHistory = async () => {
    //         const user = auth.currentUser;
    //         if (!user) return;
    //
    //         const ref = doc(db, "users", user.uid, "medicalHistory", "data");
    //         const snap = await getDoc(ref);
    //
    //         if (snap.exists()) {
    //         const d = snap.data();
    //         setConditions(d.conditions || []);
    //         setAllergies(d.allergies || []);
    //         setSurgeries(d.surgeries || []);
    //         setChronics(d.chronics || []);
    //         setNote(d.note || "");
    //         } else {
    //         await setDoc(ref, {
    //             conditions: [],
    //             allergies: [],
    //             surgeries: [],
    //             chronics: [],
    //             note: ""
    //         });
    //         }
    //     };
    //
    //     loadHistory();
    // }, []);

    React.useEffect(() => {
        if (!authReady || !user) return;

        const loadHistory = async () => {
            const ref = doc(db, "users", user.uid, "medicalHistory", "data");
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const d = snap.data();
                setConditions(d.conditions || []);
                setAllergies(d.allergies || []);
                setSurgeries(d.surgeries || []);
                setChronics(d.chronics || []);
                setNote(d.note || "");
            } else {
                await setDoc(ref, {
                    conditions: [],
                    allergies: [],
                    surgeries: [],
                    chronics: [],
                    note: ""
                });
            }
        };

        loadHistory();
    }, [authReady, user]);


    // async function saveToFirestore(field, value) {
    //     const user = auth.currentUser;
    //     console.log("Saving to Firestore", auth.currentUser);  // <- I added this debug statement
    //     if (!user) return;
    //
    //     await setDoc(
    //         // doc(db, "users", user.uid, "medicalHistory"),
    //         doc(db, "users", user.uid, "medicalHistory", "data"),
    //         { [field]: value },
    //         { merge: true }
    //     );
    // }

    async function saveToFirestore(field, value) {
        if (!user) {
            console.warn("Auth not ready, skipping Firestore write");
            return;
        }

        await setDoc(
            doc(db, "users", user.uid, "medicalHistory", "data"),
            { [field]: value },
            { merge: true }
        );
    }


    function handleChange(e){
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function addCondition() {
        const value = form.condition.trim();
        if (
            !value ||
            conditions.some(c => c.toLowerCase() === value.toLowerCase())
            ) return;


        const updated = [...conditions, value];
        setConditions(updated);
        saveToFirestore("conditions", updated);

        setForm({ ...form, condition: "" });
    }


    function addAllergy(){
        const value = form.allergy.trim();
        if (
            !value ||
            allergies.some(a => a.toLowerCase() === value.toLowerCase())
            ) return;

        const updated = [...allergies, value];
        setAllergies(updated);
        saveToFirestore("allergies", updated);

        setForm({ ...form, allergy: "" });
    }

    function addSurgery(){
        const value = form.surgery.trim();
        if (
            !value ||
            surgeries.some(s => s.toLowerCase() === value.toLowerCase())
            ) return;

        const updated = [...surgeries, value];
        setSurgeries(updated);
        saveToFirestore("surgeries", updated);

        setForm({...form, surgery:""})
    }

    function addChronic(){
        const value = form.chronic.trim();
        if (
            !value ||
            chronics.some(c => c.toLowerCase() === value.toLowerCase())
            ) return;
        const updated = [...chronics, value];
        setChronics(updated);
        saveToFirestore("chronics", updated);

        setForm({...form, chronic: ""});
    }


    function removeCondition(condition) {
        const updated = conditions.filter(
            c => c.toLowerCase() !== condition.toLowerCase()
        );

        setConditions(updated);
        saveToFirestore("conditions", updated);
    }


    function removeAllergy(allergy){
        const updated = allergies.filter(
            a => a.toLowerCase() !== allergy.toLowerCase()
        );

        setAllergies(updated);
        saveToFirestore("allergies", updated);
    }

    function removeSurgery(surgery){
       const updated =surgeries.filter(
            s => s.toLowerCase() !== surgery.toLowerCase()
        );

        setSurgeries(updated);
        saveToFirestore("surgeries", updated);
    }

    function removeChronic(chronic){
        const updated = chronics.filter(
            c => c.toLowerCase() !== chronic.toLowerCase()
        );

        setChronics(updated);
        saveToFirestore("chronics", updated);
    }

    return (
        <div className="medical-historyContainer">
            <div className="med-history-page">
            <h2 className="history-title">Medical History</h2>
            <div className = "cards">
                <div className="card">
                    <h4>Known Medical Conditions</h4>
                    <InputRow
                    name="condition"
                    value={form.condition}
                    placeholder="e.g. Diabetes"
                    onChange={handleChange}
                    onAdd={addCondition}
                    />
                    <ChipList items={conditions} onRemove={removeCondition} />
                    
                </div>
                <div className = "card">
                    <h4>Allergies</h4>
                    <InputRow
                    name="allergy"
                    placeholder="e.g. Peanuts"
                    value={form.allergy}
                    onChange={handleChange}
                    onAdd={addAllergy}
                    />
                    <ChipList items={allergies} onRemove={removeAllergy} />
                    
                </div>
            </div>
            <div className="cards">
                <div className = "card">
                    <h4>Past Surgeries</h4>
                    <InputRow
                    name="surgery"
                    value={form.surgery}
                    onChange={handleChange}
                    onAdd={addSurgery}
                    />
                    <ChipList items={surgeries} onRemove={removeSurgery} />
                    
                </div>
                <div className = "card">
                    <h4>Chronic Conditions</h4>
                    <InputRow
                    name="chronic"
                    value={form.chronic}
                    onChange={handleChange}
                    onAdd={addChronic}
                    />
                    <ChipList items={chronics} onRemove={removeChronic} />
                    
                </div>
            </div>
        </div>
        </div>
    );
}

function ChipList({ items, onRemove }) {
  return (
    <div className="chip-container">
      {items.map((item, index) => (
        <div className="chip" key={index}>
          <button onClick={() => onRemove(item)}>×</button>
          {item}
        </div>
      ))}
    </div>
  );
}

function InputRow({ name, value, placeholder, onChange, onAdd }) {
    function handleKeyDown(e){
        if (e.key == "Enter"){ 
            e.preventDefault();
            onAdd();
        }
    }

    return (
        <div className="add-row">
        <input 
            name={name} 
            value={value} 
            placeholder={(placeholder) ? placeholder : ""} 
            onChange={onChange} 
            onKeyDown={handleKeyDown}
            />
        <button onClick={onAdd}>Add</button>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <MedicalHistory />
    </React.StrictMode>
);
