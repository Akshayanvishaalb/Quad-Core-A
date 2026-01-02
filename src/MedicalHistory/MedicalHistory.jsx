import React from "react";
import "../MHPS.css"

export default function MedicalHistory(){
    const [conditions, setConditions] = React.useState([]); // store firebase data in default state instead of empty list
    const [allergies, setAllergies] = React.useState([]);
    const [surgeries, setSurgeries] = React.useState([]);
    const [chronics, setChronics] = React.useState([]);
    const [note, setNote] = React.useState("");

    const [form, setForm] = React.useState(
        {
            condition: "",
            allergy: "",
            surgery: "",
            chronic: ""
        }
    );
    function handleChange(e){
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function addCondition(){
        setConditions(prevConditions => {
            let condition = form.condition;
            if (condition){
                let valid = false, alreadyPresent = false;
                for (let i = 0; i<prevConditions.length; i++){
                    if (prevConditions[i] === condition){
                        alreadyPresent = true;
                        break
                    }
                }
                for (let i = 0; i<condition.length; i++){
                    if (condition[i] != " "){
                        valid = true;
                        break;
                    }
                }

                if (valid && !(alreadyPresent)){
                    return [...prevConditions, condition];
                }
                
                else{
                    return prevConditions;
                }
            }
            else return prevConditions;
        });

        setForm({...form, condition: ""});
    }

    function addAllergy(){
        setAllergies(prevAllergies => {
            let allergy = form.allergy;
            if (allergy){
                let valid = false, alreadyPresent = false;
                for (let i = 0; i<prevAllergies.length; i++){
                    if (prevAllergies[i] === allergy){
                        alreadyPresent = true;
                        break
                    }
                }
                for (let i = 0; i<allergy.length; i++){
                    if (allergy[i] != " "){
                        valid = true;
                        break;
                    }
                }

                if (valid && !(alreadyPresent)){
                    return [...prevAllergies, allergy];
                }
                
                else{
                    return prevAllergies;
                }
            }
            else return prevAllergies;
        })
        setForm({...form, allergy:""})
    }

    function addSurgery(){
        setSurgeries(prevSurgeries => {
            let surgery = form.surgery;
            if (surgery){
                let valid = false, alreadyPresent = false;
                for (let i = 0; i<prevSurgeries.length; i++){
                    if (prevSurgeries[i] === surgery){
                        alreadyPresent = true;
                        break
                    }
                }
                for (let i = 0; i<surgery.length; i++){
                    if (surgery[i] != " "){
                        valid = true;
                        break;
                    }
                }

                if (valid && !(alreadyPresent)){
                    return [...prevSurgeries, surgery];
                }
                
                else{
                    return prevSurgeries;
                }
            }
            else return prevSurgeries;
        })
        setForm({...form, surgery:""})
    }

    function addChronic(){
        setChronics(prevChronics => {
            let chronic = form.chronic;
            if (chronic){
                let valid = false, alreadyPresent = false;
                for (let i = 0; i<prevChronics.length; i++){
                    if (prevChronics[i] === chronic){
                        alreadyPresent = true;
                        break
                    }
                }
                for (let i = 0; i<chronic.length; i++){
                    if (chronic[i] != " "){
                        valid = true;
                        break;
                    }
                }

                if (valid && !(alreadyPresent)){
                    return [...prevChronics, chronic];
                }
                
                else{
                    return prevChronics;
                }
            }
            else return prevChronics;
        })
        setForm({...form, chronic: ""});
    }


    function removeCondition(condition){
        setConditions(
            prevConditions => {
                const newConditions = [];
                for (let i = 0; i<prevConditions.length; i++){
                    if (prevConditions[i].toLowerCase() != condition.toLowerCase()){
                        newConditions.push(prevConditions[i])
                    }
                }
                return newConditions;
            }
        );
    }

    function removeAllergy(allergy){
        setAllergies(
            prevAllergies => {
                const newAllergies = [];
                for (let i = 0; i<prevAllergies.length; i++){
                    if (prevAllergies[i].toLowerCase() != allergy.toLowerCase()){
                        newAllergies.push(prevAllergies[i])
                    }
                }
                return newAllergies;
            }
        );
    }

    function removeSurgery(surgery){
        setSurgeries(
            prevSurgeries => {
                const newSurgeries = [];
                for (let i = 0; i<prevSurgeries.length; i++){
                    if (prevSurgeries[i].toLowerCase() != surgery.toLowerCase()){
                        newSurgeries.push(prevSurgeries[i])
                    }
                }
                return newSurgeries;
            }
        );
    }

    function removeChronic(chronic){
        setChronics(
            prevChronic => {
                const newChronic = [];
                for (let i = 0; i<prevChronic.length; i++){
                    if (prevChronic[i].toLowerCase() != chronic.toLowerCase()){
                        newChronic.push(prevChronic[i])
                    }
                }
                return newChronic;
            }
        );
    }

    return (
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