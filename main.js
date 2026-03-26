async function start() {
  try {
    const response = await fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json");
    const data = await response.json();

    let makeOutput = `
      ${data.Results.map(function (item){
        return `<option>${item.Make_Name}</option>`;
      }).join('')}`;

    document.getElementById("make").innerHTML = makeOutput;

    /*
    document.getElementById("model").innerHTML = modelOutput;
    document.getElementById("year").innerHTML = yearOutput;
    document.getElementById("mileage").innerHTML = mileageOutput;
    document.getElementById("trim").innerHTML = trimOutput;
    */
    
} catch (e) {
  console.log("Error!")
  }
}
      
start();
