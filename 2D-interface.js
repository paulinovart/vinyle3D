let vinyles = document.querySelectorAll(".vinyle");
let vinyleContainer = document.querySelector(".vinyles-container");
let vinyleCovers = document.querySelectorAll(".vinyle-cover")

vinyleCovers.forEach(vinyleCover => {
    let localVinyle = vinyleCover.firstElementChild


    vinyleCover.addEventListener("mouseenter",e =>{
         localVinyle.classList.add('hovered-vinyle')
    })
    vinyleCover.addEventListener("mouseleave",e =>{
        localVinyle.classList.remove('hovered-vinyle')
   })

    
});



