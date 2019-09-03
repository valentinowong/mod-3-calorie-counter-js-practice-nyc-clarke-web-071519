// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
function displayNewCalorie(calorieEntry) {
    let newLi = document.createElement('li');
               
    newLi.className = 'calories-list-item';
    newLi.dataset.calorieEntryId = calorieEntry.id

    newLi.innerHTML =
    `<div class="uk-grid">
        <div class="uk-width-1-6">
            <strong>${calorieEntry.calorie}</strong>
            <span>kcal</span>
        </div>

        <div class="uk-width-4-5">
            <em class="uk-text-meta">${calorieEntry.note}</em>
        </div>
    </div>

    <div class="list-item-menu">
        <a class="edit-button" uk-icon="icon: pencil" uk-toggle="target: #edit-form-container"></a>
        <a class="delete-button" uk-icon="icon: trash"></a>
    </div>`
    const calorieEntryUl = document.querySelector("#calories-list")
    calorieEntryUl.appendChild(newLi);

}

document.addEventListener('DOMContentLoaded', () => {
    
    const calorieEntryUl = document.querySelector("#calories-list")
    const editForm = document.getElementById('edit-calorie-form')
    const bmrCalculatorForm = document.getElementById('bmr-calulator')

    fetch('http://localhost:3000/api/v1/calorie_entries')
        .then(response => response.json())
        .then(calorieEntriesArray => {

            calorieEntriesArray.forEach(calorieEntry => {

                displayNewCalorie(calorieEntry);
            })
        })

    const newCalorieEntryButton = document.querySelector('form#new-calorie-form>div>button')

    newCalorieEntryButton.addEventListener('click', function(event){
        event.preventDefault()

        fetch('http://localhost:3000/api/v1/calorie_entries', {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
                api_v1_calorie_entry: {
                    calorie: event.target.parentNode.children[0].children[0].value,
                    note: event.target.parentNode.children[1].children[0].value
                }
            })
          }).then(res => res.json())
          .then(response => {
            displayNewCalorie(response);
            event.target.parentNode.children[0].children[0].value = "";
            event.target.parentNode.children[1].children[0].value = "";
          })
          .catch(error => console.error('Error:', error));
    })

    calorieEntryUl.addEventListener('click', function(event) {
        if (event.target.parentNode.className === "delete-button uk-icon") {
            const calorieEntryLi = event.target.parentNode.parentNode.parentNode
            fetch(`http://localhost:3000/api/v1/calorie_entries/${event.target.parentNode.parentNode.parentNode.dataset.calorieEntryId}`, {
                method: 'DELETE',
                headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                }
            })
                .then(res => res.json())
                .then(response => {
                    calorieEntryUl.removeChild(calorieEntryLi);
                } )
                .catch(error => console.error('Error:', error));
        } else if (event.target.parentNode.className === "edit-button uk-icon") {
            const calorieEntryLi = event.target.parentNode.parentNode.parentNode
            const kcal = calorieEntryLi.children[0].children[0].innerText.slice(0, -5)
            const note = calorieEntryLi.children[0].children[1].innerText

            editForm[0].value = kcal
            editForm[1].value = note
            editForm.dataset.calorieEntryId = calorieEntryLi.dataset.calorieEntryId
        }
    });

    editForm.addEventListener('click', function(event) {
        if (event.target.tagName === "BUTTON") {
            event.preventDefault()

            console.log(editForm)

            fetch(`http://localhost:3000/api/v1/calorie_entries/${editForm.dataset.calorieEntryId}`, {
                method: 'PATCH',
                headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify({
                    api_v1_calorie_entry: {
                        calorie: editForm[0].value,
                        note: editForm[1].value
                    }
                })
            })
                .then(res => res.json())
                .then(response => {
                    const editLi = document.querySelector(`[data-calorie-entry-id='${response.id}']`)

                    editLi.innerHTML =
                        `<div class="uk-grid">
                            <div class="uk-width-1-6">
                                <strong>${response.calorie}</strong>
                                <span>kcal</span>
                            </div>

                            <div class="uk-width-4-5">
                                <em class="uk-text-meta">${response.note}</em>
                            </div>
                        </div>

                        <div class="list-item-menu">
                            <a class="edit-button" uk-icon="icon: pencil" uk-toggle="target: #edit-form-container"></a>
                            <a class="delete-button" uk-icon="icon: trash"></a>
                        </div>`
                    
                    document.getElementById('edit-form-container').style = ""
                })
        }
    })

    bmrCalculatorForm.addEventListener('submit', function(event) {
        event.preventDefault();

        console.dir(event.target);

        const progressBar = document.querySelector('div#bmr-calculation-result>progress');

        const lowerBmiSpan = document.getElementById('lower-bmr-range')
        const higherBmiSpan = document.getElementById('higher-bmr-range')

        const lowerRangeBmr = 655 + (4.35 * parseFloat(event.target[0].value)) + (4.7 * parseFloat(event.target[1].value)) - (4.7 * parseFloat(event.target[2].value));
        const upperRangeBmr = 66 + (6.23 * parseFloat(event.target[0].value)) + (12.7 * parseFloat(event.target[1].value)) - (6.8 * parseFloat(event.target[2].value));
        const averageBmr = (lowerRangeBmr + upperRangeBmr) / 2;

        lowerBmiSpan.textContent = lowerRangeBmr
        higherBmiSpan.textContent = upperRangeBmr

        progressBar.max = averageBmr
    })

})
