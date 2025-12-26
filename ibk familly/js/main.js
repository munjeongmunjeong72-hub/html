$(function(){

    $(".family2 .familylist").hide()
    $(".family .familylist").hide()

     $(".family2 button").click(function(){
        $(".family2 .familylist").toggle() })

    $(".family button").click(function(){
        $(".family .familylist").toggle()  
    })
})