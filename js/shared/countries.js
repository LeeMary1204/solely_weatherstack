$(document).ready(function() {
    const countries = JSON.parse(document.getElementById('countries').innerHTML)

    let stateInput = $('input#state')
    let stateLabel = $('label#state-label')
    let stateSelect = $('select#state-select')
    let stateSelectLabel = $('label#state-select-label')

    stateSelect.hide()
    stateSelectLabel.hide()

    $('#country_code').on('change', function() {
        let country = this.selectedOptions[0].innerText
        let states = countries[country]

        if(states !== undefined) {
            stateInput.hide()
            stateLabel.hide()
            stateSelect.show()
            stateSelectLabel.show()

            stateInput.val('')
            stateSelect.find('option').remove()
            stateSelect.prop('required', true);
            stateSelect.append(new Option('Select a state', ''))

            $.each(states, (key, val) => {
                stateSelect.append(new Option(val, val))
            });
        }else{
            stateInput.show()
            stateLabel.show()
            stateSelect.hide()
            stateSelectLabel.hide()

            stateSelect.find('option').remove()
            stateSelect.prop('required', false);
        }
    })
});