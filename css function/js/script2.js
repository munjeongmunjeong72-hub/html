$(function(){

    $(".wrap").css({"margin-bottom":50})

    $("li").css({"list-style":"none"})
$("ul").css({"width":"870px","height":"202px","display":"flex","gap":"20px"})

$("ul li.b1").css({"width":"202px","height":"202px","background":"red","border":"1px solid #000"})

$("ul li.b2").css({"width":"202px","height":"202px","background":"orange","border":"1px solid #000"})

$("ul li.b3").css({"width":"202px","height":"202px","background":"yellow","border":"1px solid #000"})

$("ul li.b4").css({"width":"202px","height":"202px","background":"green","border":"1px solid #000"})

// 숨김버튼을 누르면 숨겨지는 이벤트
// class>중복사용가능 / id>중복사용 불가능
$("#btn1").click(function(){
$("ul li:first-child").hide()
})

// 보이는 이벤트
$("#btn2").click(function(){
    $("ul li:first-child").show()
})
// 보였다 숨기는 이벤트
$("#btn3").click(function(){
    $("ul li:nth-child(3)").toggle()
})
// 100*100 되는 이벤트
$("#btn4").click(function(){
    $("ul li:last-child").width(100)
    $("ul li:last-child").height(100)
})
$("#btn5").click(function(){
    $("ul li:last-child").width(202)
    $("ul li:last-child").height(202)
})
})