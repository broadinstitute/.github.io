function show_selection() {
    document.getElementById("cbox_button").style.display = "block"
}

//create the list of checkboxes for each data field in the input
function write_checkboxes() {
    //display page element that has the list of checkoxes
    document.getElementById("boxes").style.display = "block"
    document.getElementById("filter_options").style.display = "block"
    names_of_fields = data_array[0]
    new_other_format = data_array.slice(1)
    new_all_rows = []
    for (i = 0; i < names_of_fields.length; i++) {
        let vals = []
        for (j = 0; j < new_other_format.length; j++) {
            vals.push(new_other_format[j][i])
        }
        new_all_rows.push(vals)
    }

    //reset the checkboxes 
    document.getElementById("cboxes").innerHTML = " "
    document.getElementById("pkr_cboxes").innerHTML = " "
    //loop through the names of the fields for the input files, and make 
    //a checkbox for each of those fields
    for (let i = 1; i < names_of_fields.length - 1; i++) {
        document.getElementById("cboxes").innerHTML += '<input name="data_selection" type="checkbox" value='+ names_of_fields[i] + '>'
        document.getElementById("cboxes").innerHTML += '<label for="data_selection">' + names_of_fields[i] + '</label>'
        document.getElementById("cboxes").innerHTML += '<br>'
    }
    //add select all checkbox for data fields
    document.getElementById("cboxes").innerHTML += '<input name="data_selection_select_all" type="checkbox" value="string_val" onclick=select_all("cboxes")>'
    document.getElementById("cboxes").innerHTML += '<label for="data_selection_select_all"> Select All</label> <br>'
    //button that displays table containing selected fields when pushed
    document.getElementById("cboxes").innerHTML += '<input id="cboxes_button" type="button" onClick="display_data' + "('data_selection', 'pkr_selection')" + '" value="Display Data">'
    //loop through the pkrs submitted by the user, and make a checkbox for 
    //each one
    for (pkr_name of new_all_rows[0]) {
        document.getElementById("pkr_cboxes").innerHTML += '<input name="pkr_selection" type="checkbox" value='+ pkr_name + ' checked>'
        document.getElementById("pkr_cboxes").innerHTML += '<label for="pkr_selection">' + pkr_name + '</label>'
        document.getElementById("pkr_cboxes").innerHTML += '<br>'
    }
    //add select all checkbox for 
    document.getElementById("pkr_cboxes").innerHTML += '<input name="pkr_selection_select_all" type="checkbox" value="string_val" onclick=select_all("pkr_cboxes") checked>'
    document.getElementById("pkr_cboxes").innerHTML += '<label for="pkr_selection_select_all"> Select All</label> <br>'

}

function reset_display() {
    document.getElementById("boxes").style.display = "none"
    document.getElementById("filter_options").style.display = "none"
    document.getElementById("box_display").style.display = "block"
    document.getElementById("data_table").innerHTML = ""
}

function populate_selected_fields(values) {
    selected_fields = ["PKR"]
    //create list of the data field to display that were chekced by user
    filter_list = document.getElementById("filtration_options")
    for (selected of values) {
        selected_fields.push(selected)
        option = document.createElement('option')
        option.value = selected
        filter_list.appendChild(option)
    }
    return selected_fields
}

//write header of table of user selected values. asc_or_dec_by_col is a
//boolean array that represents if each column of the table is sorted by
//ascending or descending to allow for sorting and reverse sorting 
function write_table_headers(selected_fields, h_row, asc_or_dec_by_col) {
    for (field in selected_fields) {
        h_cell = h_row.insertCell()
        h_cell.innerHTML += selected_fields[field]
        //add an on click function to the header cells that sorts the table
        //by that row when clicked
        h_cell.onclick = function() {asc_or_dec_by_col = sort_and_flip(document.getElementById("data_table"), selected_fields.indexOf(this.textContent), asc_or_dec_by_col)}
        //add double click function that reverses red-green coloration
        h_cell.ondblclick = function () {toggle_coloration(selected_fields.indexOf(this.textContent))}
        idx_of_field = names_of_fields.indexOf(selected_fields[field])
        indicies.push(idx_of_field)
        asc_or_dec_by_col.push(false)
    }
    return indicies
}

//given an array of rows of the table, produce an array of columns of the
//table 
function make_table_columns(rows_of_table) {
    cols_of_table = []
    for (i = 1; i < rows_of_table[0].length; i++) {
        col = []
        for (j = 0; j < rows_of_table.length; j++) {
            col.push(Number(rows_of_table[j][i]))
        }
        cols_of_table.push(col)
    }
    return cols_of_table
}

//normalize the values in a column between 0 and .5 by the min and max
//values of that column 
function normalize_column_values(cols_of_table) {
    normalized_columns = []
    for (column of cols_of_table) {
        col_norm = []
        min = Math.min(...column)
        max = Math.max(...column)
        for (val of column) {
            norm_val = (val - min) / (max - min) 
            col_norm.push(norm_val / 2)
        }
        normalized_columns.push(col_norm)
    }
    return normalized_columns
}

//write a cell in the table formated based on the contents of the cell 
//right now the sample data this has been run on all use local images, so
//detecting if a cell is an image is done by looking for the https at the 
//start. However, when this is switched to work with the actual image 
//encodings produced by the pipeline it will need to look for something
//different 
function write_formated_table_cell(new_row, value, normalized_column, table_row, rows_of_table) {
    new_cell = new_row.insertCell()
    //if value ends in png, insert as a link
    if (value == "") {
        new_cell.innerHTML = NaN
        new_cell.style.backgroundColor = "rgba(0, 0, 225, " + .4 + ")"
    }
    else if (value.slice(value.length - 3, value.length) == "png") {
        new_cell.innerHTML = '<img src=" ' + value + '" width="100%"> </img>'
    }
    else if (value.slice(0, 5) == "https") {
        new_cell.innerHTML = '<img src=" ' + value + '" width="100%"> </img>'
    }
    
    else if (value.slice(0,3) == "PKR") {
        new_cell.textContent = value
    }
    
    else if (!(isNaN(value))) {
        //set the background opacity for numeric field based on how that 
        //value is normalized
        normalized_value = Number(normalized_columns[table_row.indexOf(value) - 1][rows_of_table.indexOf(table_row)])
        value = Number(value)
        new_cell.textContent = value
        new_cell.style.width = "100px"
        new_cell.style.backgroundColor = "rgba(0, 225, 0, " + normalized_value + ")"
    }
    //write any data in a format not recognized above exactly how it
    //appears in the table
    else {
        new_cell.textContent = value
    }
}
    
//round the numeric values in an array to the nearest hundred, but can
//be changed to whatever. Probably good to decide how to round based on the
//range of possible values for a column given some are # cells and some are
//percents so there is dramatic variation of scale
function round_numeric_values(table_array) {
new_array = []
for (row of table_array) {
    new_row = []
    for (value of row) {
        if (!(isNaN(value))) {
            numeric_value = Number(value)
            //round to the nearest hundred, 
            rounded_numeric = Math.round(numeric_value / 100) * 100
            formated_numeric = rounded_numeric.toLocaleString()
            new_row.push(formated_numeric) 
        }
        else {
            new_row.push(value)
        }
    }
    new_array.push(new_row)
}
return new_array
}

//write a table to the html page containing the fields the pkrs and the
//data fields selected by the user
function display_data(selected_data, pkr_selected_data){
    reset_display()
    table_rounded = round_numeric_values(data_array_rounded)
    //get contents from each checked checkbox
    const checked = document.querySelectorAll('input[name="' + selected_data +'"]:checked'), values = [];
    Array.prototype.forEach.call(checked, function(el) {
        values.push(el.value);
    });
    //get the pkr expirments that have been selected for display
    const pkr_checked = document.querySelectorAll('input[name="' + pkr_selected_data +'"]:checked'), pkr_values = [];
    Array.prototype.forEach.call(pkr_checked, function(el) {
        pkr_values.push(el.value);
    });
    //for each field selected, create a new row in the table and populate 
    //it with the values from each checked field
    table = document.getElementById("data_table")
    header = table.createTHead()
    h_row = header.insertRow()
    selected_fields = populate_selected_fields(values)
    //create list of the data field to display that were chekced by user
    rows_of_table = []
    indicies = []
    //table to hold the direction for sorting of a column
    asc_or_dec_by_col = []
    //write all of the selected data fields as headers of the table
    indicies = write_table_headers(selected_fields, h_row, asc_or_dec_by_col)
    for (pkr of data_array.slice(1)) {
        table_row = []
        for (index of indicies) {
            table_row.push(pkr[index])
        }
        rows_of_table.push(table_row)
    }
    body = table.createTBody()  
    cols_of_table = make_table_columns(rows_of_table)
    normalized_columns = normalize_column_values(cols_of_table)
    for (table_row of rows_of_table) {
        if (pkr_values.includes(table_row[0])) {
            new_row = body.insertRow()
            for (value of table_row) {
                write_formated_table_cell(new_row, value, normalized_columns, table_row, rows_of_table)
            }
        }
    } 
    if (check_if_checked("round_nums")) {
        console.log("need to round number")
        toggle_round(table)
    }
    if (check_if_checked("transpose")) {
        console.log("need to transpose table")
        transpose_table(table)
    }
}

//switch the table from displaying the rounded values of the numbers and
//the unrounded values
function toggle_round(table) {
    const checked = document.querySelectorAll('input[name="round_nums"]:checked'), values = [];
    Array.prototype.forEach.call(checked, function(el) {
        values.push(el.value);
    });
    
    //get the names of the fields being displayed in the table
    const checked_fields = document.querySelectorAll('input[name="data_selection"]:checked'), fields_values = [];
    Array.prototype.forEach.call(checked_fields, function(el) {
        fields_values.push(el.value);
    });
    //using the names of fields checked by the user, get the index of that
    //filed name in the header of the local array representation. This is
    //the index in each row of the array where that value appears
    selected_indicies = []
    for (value of fields_values) {
        selected_indicies.push(data_array_rounded[0].indexOf(value))
    }
    table_body = table
    table_rows = table_body.querySelectorAll("tr")
    //check if round numbers is selected: if it isnt, replace the values in
    //the table with the ones in the unrounded local array, and if it is
    //replace the table values with the rounded ones 
    if (values.length == 0) {
        for (table_row of table_rows) {
            replace_numeric_values(table_row, data_array_unrounded, selected_indicies)
        }
    }
    else {
        for (table_row of table_rows) {
            replace_numeric_values(table_row, data_array_rounded, selected_indicies)
        }
    }
}

//wrapper function for alternating between rounded and unrounded numbers.
//This wrapper exists so that the code that switches the state of the 
//numbers does not need to check if its transposed or call display_data
//important note: when the table is transposed, this works by building the 
//table again untransposed, changing all the numbers, and then transposing 
//it again. This means that any sorting order or changes in coloration will 
//be reset when choosing to round transposed data
function toggle_round_wrapper(table) {
    if(check_if_checked("transpose")) {
        display_data('data_selection', 'pkr_selection')
    }
    toggle_round(table)
    if(check_if_checked("transpose")) {
        transpose_table(document.getElementById("data_table"))
    }
}

//returns a table that is the transpose of the passed one. This is achieved
//by creating an array of td elements from the old table, transposing that
//array, and re-writing the table from that array.
//Important: when transposing from the way the table is generated normally, 
//the td elements get moved around. The formating looks the same, but the
//sorting and coloration functionalty does not continue to work on the 
//tansposed table. Any sorting or coloration applied before transposing is
//maintained, but it cannot be applied once transposed. Those changes are 
//all lost when the table is transposed again, as the table is fully 
//re-written with the function used to generate it initially
function transpose_table(table) {
    //transposing default table
    if (check_if_checked("transpose")) {
        //get contents of table 
        old_header = table.tHead
        old_body = table.tBodies[0]
        //initialize structures to hold the trs
        table_array = []
        header_array = []
        body_array = []
        //generate an array of td elements from the table header
        tr_header_nodelist = old_header.querySelectorAll("tr")
        td_header_nodelist = tr_header_nodelist[0].querySelectorAll("td")
        for (td of td_header_nodelist) {
            header_array.push(td)
        }
        table_array.push(header_array)
        
        //for each row of the body, make a list of tr elements in that row
        //and append it to one master list
        tr_body_nodelist = old_body.querySelectorAll("tr")
        for (tr of tr_body_nodelist) {
            row = []
            td_body_nodelist = tr.querySelectorAll("td")
            for (td of td_body_nodelist) {
                row.push(td)
            }
            table_array.push(row)
        }
        //set dimensions for transposed table 
        data_array_transpose = []
        transpose_row_length = table_array.length
        transpose_col_length = table_array[0].length 
        //initialize transposed array
        for (j = 0; j < transpose_col_length; j++) {
            data_array_transpose[j] = Array(transpose_row_length)
        }
        //populate the transpose array
        for (i = 0; i < transpose_row_length; i++) {
            for (j = 0; j < transpose_col_length; j++) {
                data_array_transpose[j][i] = table_array[i][j]
            }
        }
        //clear the old contents of the table
        while (old_header.firstChild) {
            old_header.removeChild(old_header.firstChild)
        }
        while (old_body.firstChild) {
            old_body.removeChild(old_body.firstChild)
        }
        //write the new table from the arrays of td elements
        new_header = table.createTHead()
        h_row = new_header.insertRow()
        transpose_header = data_array_transpose.shift()
        for (td of transpose_header) {
            h_row.appendChild(td)
        }
        new_body = table.createTBody()
        for (tr of data_array_transpose) {
            t_row = new_body.insertRow()
            for (td of tr) {
                t_row.appendChild(td)
            }
        }
    }
    //transposing table back to default. Done by re-writing the table from 
    //the function that generated it initially
    else {
        display_data('data_selection', 'pkr_selection')
        if (check_if_checked("round_nums")) {
            toggle_round(document.getElementById("data_table"))
        }
    }
}

function toggle_show() {
    document.getElementById("boxes").style.display = "block"
    document.getElementById("box_display").style.display = "none"
    document.getElementById("filter_options").style.display = "block"
}

//change the numbers in a row of the table with numbers from an array, 
//used to write rounded/unrounded values saved in arrays into the main 
//table 
function replace_numeric_values(table_row, table_array, selected_indicies) {
    pkr_id = table_row.querySelector("td").innerText
    //dont do anything if you are on the header of the table
    if (pkr_id == "PKR") {
        return
    }
    i = 0
    //get the row of the table in the array that corresponds with the
    //passed in row of the table by matching the pkr id fields
    matching_row = table_array[i]
    row_pkr = matching_row[0]
    while (i < table_array.length) {
        i = i + 1
        matching_row = table_array[i]
        row_pkr = table_array[0]
        if (pkr_id == matching_row[0]) {
            break
        }
    }
    //get the values from the table array that correspond to ones being 
    //displayed in the table. Need to do this because the table might not 
    //contain all the possible values if the user has selected some to not
    //be displayed
    replacement_vals = []
    for (index of indicies) {
        replacement_vals.push(matching_row[index])
    }
    tds = table_row.querySelectorAll("td")
    i = 0
    //for each cell of the table row, determine if the contents reperesent
    //a number, and if so repace them with the corresponding value from
    //the table array
    for (td of tds) {
        if (/^[0-9,.]*$/.test(td.innerHTML)) {
            td.innerHTML = replacement_vals[i]
        }
        i ++ 
    }
}

//color the numeric values of a table column based on standard deviations
//away from a user submitted mean. Green cells are greater than 0, red are
//less, and the opacity reflects the magnitude of this difference
function color_by_mean () {
    event.preventDefault()
    document.getElementById("boxes").style.display = "none"
    filter_field = document.getElementById("data_field").value
    filter_value = document.getElementById("f_val").value
    //ensure that supplied mean is a number 
    if (!Number(filter_value)) {
        alert("Cannot filter on non number")
        return
    }
    table_body = table.tBodies[0]
    console.log(table_body)
    rows = Array.from(table_body.querySelectorAll("tr"))
    const checked = document.querySelectorAll('input[name="round_nums"]:checked'), values = [];
        Array.prototype.forEach.call(checked, function(el) {
            values.push(el.value);
        });
    
    //if the rounded option is selected, replace the rounded values with the
    //untounded for proper sorting
    if (values.length == 1) {
        for (table_row of rows) {
            replace_numeric_values(table_row, data_array_unrounded, selected_indicies)
        }
    }
    table_header = table.tHead
    headers = table_header.querySelectorAll("td")
    i = 0
    row_values = []
    for (header of headers) {
        i += 1
        //loop through the header values until one matches with the one 
        //selected by the user
        if (header.innerText == filter_field) {
            h_values = headers.values()
            for (row of rows) {
                row_values.push(Number(row.querySelector(`td:nth-child(${i})`).textContent))
            }
            //calcute z scores for all of the values in the selected column 
            //using the submitted mean 
            diff_squared_array = row_values.map((num) => Math.pow((num - filter_value), 2))
            initial_val = 0
            diff_squared_array_sum = diff_squared_array.reduce((running_sum, curr_value) => running_sum + curr_value, initial_val)
            std_dev = Math.sqrt(diff_squared_array_sum / row_values.length)
            z_score_array = row_values.map((num) => (num - filter_value) / std_dev)
            console.log("z score array is " + z_score_array)
            //normalize the absolute values of the z-scores to create opacity
            //values
            z_score_array_abs = z_score_array.map((num) => (Math.abs(num)))
            z_scores_normalized_abs = []
            min = Math.min(...z_score_array_abs)
            max = Math.max(...z_score_array_abs)
            for (val of z_score_array_abs) {
                norm_val = (val - min) / (max - min) 
                z_scores_normalized_abs.push(norm_val)
            }
            //loop back through the rows, coloring them based on sign of 
            //of the z score and opacity based on magnitude of z score
            for (row of rows) {
                row_td = row.querySelector(`td:nth-child(${i})`)
                green_and_opacity = get_green_and_opacity(row_td)
                green_value = green_and_opacity[0]
                opacity = green_and_opacity[1]
                
                //set opacity values based on z scores normalized between 0
                // and 0.5 
                opacity = z_scores_normalized_abs[rows.indexOf(row)]
                red_value = 0
                
                //chose red or green based on the sign of the z score
                if (z_score_array[rows.indexOf(row)] >= 0) {
                    green_value = 0
                    red_value   = 225
                }
                else {
                    green_value = 225
                    red_value = 0
                }
                opacity = opacity / 2
                row_td.style.backgroundColor = "rgba("+ green_value + "," + red_value + ", 0," + opacity + ")"
            }
            if (values.length == 1) {
                for (table_row of rows) {
                    replace_numeric_values(table_row, data_array_rounded, selected_indicies)
                }
            }
            return
        }
    }
    //alert the user and exit the function if the field name they provided
    //does not match any of the ones in the table
    alert("Not a valid field")
    return
}

//re-write the table to revert all coloring to the original values
function clear_coloring() {
    event.preventDefault()
    document.getElementById("cboxes_button").click()
}

//flips the value of the checked box, and changes the value of all of the
//checkboxes in the group to match. Used to implement select/deselect all
//boxes
function select_all(checklist_name) {
    this.checked = !this.checked
    checklist = document.getElementById(checklist_name)
    boxes = checklist.querySelectorAll("input")
    for (box of boxes) {
        box.checked = this.checked
    }
} 

//sort a column of the table in a given direction 
function sort_table(table, column, asc) {
    table_body = table.tBodies[0]
    rows = Array.from(table_body.querySelectorAll("tr"))
    //check if the numbers in the table are rounded
    const checked = document.querySelectorAll('input[name="round_nums"]:checked'), values = [];
        Array.prototype.forEach.call(checked, function(el) {
            values.push(el.value);
        });

    const checked_fields = document.querySelectorAll('input[name="data_selection"]:checked'), fields_values = [];
        Array.prototype.forEach.call(checked_fields, function(el) {
            fields_values.push(el.value);
        });
        
    selected_indicies = []
    for (value of fields_values) {
        selected_indicies.push(data_array_rounded[0].indexOf(value))
    }
    
    //if the rounded option is selected, replace the rounded values with the
    //untounded for proper sorting
    if (values.length == 1) {
        for (table_row of rows) {
            replace_numeric_values(table_row, data_array_unrounded, selected_indicies)
        }
    }
    direction = asc ? 1 : -1
    //define a new sorting function that casts the strings stored in the 
    //table to numbers and compares their values
    sorted_rows = rows.sort((a, b) => {
        a_col_text = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim()
        b_col_text = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim()
        a_as_num = Number(a_col_text)
        if (isNaN(a_as_num)) {
            if (asc) {
                a_as_num = Infinity 
            }
            else {
                a_as_num = 0
            }
        }
        b_as_num = Number(b_col_text)
        if (isNaN(b_as_num)) {b
            if (asc) {
                b_as_num = Infinity
            }
            else {
                b_as_num = 0
            }
        }
        return a_as_num > b_as_num ? (1 * direction) : (-1 * direction)
    })
    //remove the old rows of the table
    while (table_body.firstChild) {
        table_body.removeChild(table_body.firstChild)
    }
    //replace them with the new sorted ones
    table_body.append(...sorted_rows)
    
    if (values.length == 1) {
        for (table_row of rows) {
            replace_numeric_values(table_row, data_array_rounded, selected_indicies)
        }
    }
}

//sort the table by whatever direction it is not already sorted in, and
//return the array of bools representing column sorting direction upated to
//reflect this change
function sort_and_flip(table, column, sort_bools) {
    direction = sort_bools[column]
    sort_table(table, column, direction)
    sort_bools[column] = !sort_bools[column] 
    return sort_bools
}

//this was the first coloration filter. The user would select a column to
//filter, a direction (>, <, ==), and a value. Each cell the comparison was 
//true for would be green, and each one where its false would be red.
//Leaving this in for now but not sure if it will be used again
function filter_column () {
    event.preventDefault()
    filter_field = document.getElementById("data_field").value
    filter_value = document.getElementById("f_val").value
    //make sure input value is a number 
    if (!Number(filter_value)) {
        alert("Cannot filter on non number")
        return
    }
    //direction = get_radio_button_selection()
    table = document.getElementById("data_table")
    table_body = table.tBodies[0]
    //get table row elements from the table
    rows = Array.from(table_body.querySelectorAll("tr"))
    table_header = table.tHead
    headers = table_header.querySelectorAll("td")
    i = 0
    for (value of headers.values()) {
        i += 1
        //loop through the header values until one matches with the one 
        //selected by the user
        if (value.innerText == filter_field) {
            h_values = headers.values()
            //color the cell red depedning on the sorting direction chosen, 
            //the value of the cell, and the value to sort around
            for (row of rows) {
                if (direction == "greater") {
                    if (Number(row.querySelector(`td:nth-child(${i})`).innerText) < filter_value) {
                        row.querySelector(`td:nth-child(${i})`).style.backgroundColor = "rgba(225, 0, 0, .5)"   
                    }
                }
                else if (direction == "less") {
                    if (Number(row.querySelector(`td:nth-child(${i})`).innerText) > filter_value) {
                        row.querySelector(`td:nth-child(${i})`).style.backgroundColor = "rgba(225, 0, 0, .5)"   
                    }
                }
                else if (direction == "equal") {
                    if (Number(row.querySelector(`td:nth-child(${i})`).innerText) != filter_value) {
                        row.querySelector(`td:nth-child(${i})`).style.backgroundColor = "rgba(225, 0, 0, .5)"   
                    }
                }
                else {
                    //send page alert if no direction selected 
                    alert("Input a direction")
                    return
                }
            }
        return
        }
    }
    //send page alert if there is no 
    alert("Not a valid field")
}

//switch the coloration of a column between green and red
function toggle_coloration(col_idx) {
    table = document.getElementById("data_table")
    table_body = table.tBodies[0]
    rows = Array.from(table_body.querySelectorAll("tr"))
    //loop through each of the rows getting the value from the selected column 
    for (row of rows) {
        row_value = row.querySelector(`td:nth-child(${col_idx + 1})`)  
        if (!(row_value.innerHTML == "NaN")) {
            green_and_opacity = get_green_and_opacity(row_value)
            green_val = green_and_opacity[0]
            opacity = green_and_opacity[1]
            new_green_val = 0
            new_red_val = 0
            //if cell is green, make red, and vice versa 
            if (green_val > 1) {
                new_green_val = 0
                new_red_val = 225
            }
            else {
                new_green_val = 225
                new_red_val = 0
            }
            rgb_string = "rgba("+ new_red_val + "," + new_green_val + ", 0," + (.5 - opacity) + ")"
            row_value.style.backgroundColor = rgb_string
        }
        
    }
}

//extract the green value and opacity value from rgba field of table cell 
function get_green_and_opacity(td_elem) {
    rgba_str = getComputedStyle(td_elem).backgroundColor
    rgba_within_paren = rgba_str.match(/[^()]+/g)
    rgba_color_vals = rgba_within_paren[1]
    rgba_color_vals_list = rgba_color_vals.split(',')
    green_val = rgba_color_vals_list[1]
    opacity = rgba_color_vals_list[3]
    return [green_val, opacity]

}

function check_if_checked(checklist_name) {
    const checked = document.querySelectorAll('input[name=' + checklist_name + ']:checked'), values = [];
        Array.prototype.forEach.call(checked, function(el) {
            values.push(el.value);
        });
    return (values.length == 1)
}

