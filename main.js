token = localStorage.token
api = `https://api.pluralkit.me/v1`

hideout = null
function loadToken() {
    clearTimeout(hideout)
    token = $("#token").val()
    if (!token.match(/[A-Za-z0-9+/=]{64}/)) { // $("#invalid-token-alert").fadeIn(200)
        $("#invalid-token-alert").show("slide", {
            direction: "down",
            distance: 300
        }, 300)
        hideout = setTimeout(() => {
            $("#invalid-token-alert").hide("slide", {
                direction: "down",
                distance: 300
            }, 400)
        }, 6 * 1000);
        return
    }
    $("#invalid-token-alert").hide("slide", {
        direction: "down",
        distance: 300
    }, 400)
    localStorage.token = token
    loadPage()
}

system = null
members = null

async function loadPage() {
    $("#token").val(token)
    await getSystem()
    await getMembers()
}

async function getMembers() {
    members = await $.ajax({
        url: api + `/s/${
            system.id
        }/members`,
        method: "GET",
        dataType: "json",
        headers: {
            "Authorization": `${token}`
        }
    })
    $("#member-grid").empty()
    members.forEach(member => {

        if(member.avatar_url){
            avatar = member.avatar_url.replace("http://","https://")
        } else {
            avatar = null
        }

        $("#member-grid").append(`<div class="member" id="${member.id}" style="background:linear-gradient(to bottom,#${
            member.color || "fff"
        } 1.8em,#0002 1.81em,#0000 2.4em), url('${
            avatar
        }') 50% .8rem,#${
            member.color || "fff"
        }; background-size: cover; background-repeat:no-repeat;background-clip: content-box; 
            " onclick="clickCheck(event, '${
            member.id
        }')"><div class="member-content">${
            member.name
        }</div></div>`)
    });
}

shiftClick = false
toSwitch = []

function toggleClick(e){
    e.stopPropagation()
    if(!shiftClick){
        shiftClick = true
        enableMulti()
    } else {
        shiftClick = false
        toSwitch = []
        disableMulti()
    }
    
}

async function clickCheck(event, id){
    event.stopPropagation()
    if(event.shiftKey || shiftClick) {
        $(`#${id}`).toggleClass("selected")

        if(toSwitch.includes(id)) toSwitch.splice(toSwitch.indexOf(id),1)
        else toSwitch.push(id)
    
        if($(`.selected`).length || shiftClick) enableMulti()
        else disableMulti()

    } else {
        disableMulti()

        toSwitch = [id]
        switchMember()
    }
}

function enableMulti(){
    $(`.switch`).show(200)
    $(`.member`).addClass("unselected")
}
function disableMulti(){
    $(`.switch`).hide(200)
    $(`.member`).removeClass("unselected selected")
    shiftClick = false
}


async function switchMember() {

    let membersToSwitch = members.filter(member=>toSwitch.includes(member.id))

    await $(".switch-name").text(gramJoin(membersToSwitch.map(member=>member.name)))
    
    $(".alert").hide()
    try {
        await $.post({
            type: "POST",
            url: api + "/s/switches",
            data: `{members:['${toSwitch.join("','")}']}`,
            contentType: "application/json",
            headers: {
                "Authorization": `${token}`
            }
        })
        $("#switch-alert").show("slide", {
            direction: "down",
            distance: 300
        }, 300)
        hideout = setTimeout(() => {
            $("#switch-alert").hide("slide", {
                direction: "down",
                distance: 300
            }, 400)
        }, 6 * 1000);
        getFronters()
    } catch (error) {
        console.log(error)
        if (error.status == "400") {
            $("#switch-error-alert").show("slide", {
                direction: "down",
                distance: 300
            }, 300)
            hideout = setTimeout(() => {
                $("#switch-error-alert").hide("slide", {
                    direction: "down",
                    distance: 300
                }, 400)
            }, 6 * 1000);
        } else {
            $("#error").text(error.status)
            $("#generic-alert").show("slide", {
                direction: "down",
                distance: 300
            }, 300)
            hideout = setTimeout(() => {
                $("#generic-alert").hide("slide", {
                    direction: "down",
                    distance: 300
                }, 400)
            }, 6 * 1000);
        }
    }
    toSwitch = []
}

async function getSystem() {
    if(token == undefined) return help()
    try {
        system = await $.ajax({
            url: api + "/s",
            method: "GET",
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', token);
            }
        })
        getFronters()
    } catch (error) {
        console.log(error)
        if (error.status == 401) {
            $("#invalid-token-alert").show("slide", {
                direction: "down",
                distance: 300
            }, 300)
            hideout = setTimeout(() => {
                $("#invalid-token-alert").hide("slide", {
                    direction: "down",
                    distance: 300
                }, 400)
            }, 6 * 1000);
        } else {
            $("#error").text(error.status)
            $("#generic-alert").show("slide", {
                direction: "down",
                distance: 300
            }, 300)
            hideout = setTimeout(() => {
                $("#generic-alert").hide("slide", {
                    direction: "down",
                    distance: 300
                }, 400)
            }, 6 * 1000);
        }
        return
    }
}
fronters = null

async function getFronters() {
    try{
        fronters = await $.ajax({
            url: api + `/s/${
                system.id
            }/fronters`,
            method: "GET",
            dataType: "json",
            headers: {
                "Authorization": `${token}`
            }
        })
    } catch (error) {
        console.log(error)
        if (error.status == 401) {
            $("#invalid-token-alert").show("slide", {
                direction: "down",
                distance: 300
            }, 300)
            hideout = setTimeout(() => {
                $("#invalid-token-alert").hide("slide", {
                    direction: "down",
                    distance: 300
                }, 400)
            }, 6 * 1000);
            return
        }
        else if (error.status == 404){ //hacky hack to catch no fronters
            fronters = {
                timestamp: null,
                members: []
            }
        }
        else {
            $("#error").text(error.status)
            $("#generic-alert").show("slide", {
                direction: "down",
                distance: 300
            }, 300)
            hideout = setTimeout(() => {
                $("#generic-alert").hide("slide", {
                    direction: "down",
                    distance: 300
                }, 400)
            }, 6 * 1000);
            return
        }
    }
    $("#fronters-span")[0].innerText = gramJoin(fronters.members.map(member=>member.name))
}

function gramJoin(array){
    let string

    switch (array.length) {
        case 0:
            string = "None"
            break;
        case 1:
            string = array[0]
            break;
        case 2:
            string = `${array[0]} and ${array[1]}`
            break;
        default:
            let last = array.pop()
            string = array.join(", ")
            string += `, and ${last}`
            break;
    } 

    return string
}

function help(){
    $("#help-alert").show("slide", {
        direction: "down",
        distance: 300
    }, 300)
    hideout = setTimeout(() => {
        $("#help-alert").hide("slide", {
            direction: "down",
            distance: 300
        }, 400)
    }, 15 * 1000);
}