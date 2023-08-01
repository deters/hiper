export async function add(busca: string): number {


    let result = await fetch("https://search.osuper.com.br/ecommerce_products_production/_search", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "content-type": "application/json",
    },
    "referrer": "https://hiperselect.com.br/",
    "body": JSON.stringify({accountId:53,storeId:153,categoryName:null,first:100,
      "promotion":null,"after":null,search:busca,
      brands:[],categories:[],tags:[],personas:[],
      sort: {"field":`pricing.price`,order:`desc`},pricingRange:{},highlightEnabled:true}),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  });
  
    return result.json();
  }
  
  // Learn more at https://deno.land/manual/examples/module_metadata#concepts
  if (import.meta.main) {
  
    let SEARCH = Deno.args[0].toUpperCase()
  
    let result = await add(SEARCH);
  
    // console.log(result)
  
    let data = 
      result.edges.map(edge => edge.node)
      .map(node => {
        return { name: node.name, price: node.pricing[0].promotionalPrice, amount: (kilogramas(node.name) || litros(node.name) || metros(node.name) || 1) * (unidades(node.name) || 1)}
      })
      .map(node => {
        return Object.assign({}, 
          node, 
          {amount_price: Math.round(node.price / (node.amount) * 100)/100},
          )
      })
      .filter(p => p.name.toUpperCase().startsWith(SEARCH))
      .sort(compare)
    console.log(JSON.stringify(data, null, 4));
  }
  
  function kilogramas(name: string){
    let gramas = /([0-9]+)(g)/;
    let match =  name.match(gramas)
    if (match){
      return parseFloat(match[1])/1000
    }
  
    let kilos = /([0-9]+)(kg)/;
    match =  name.match(kilos)
    if (match){
      return parseFloat(match[1])
    }
  
  
  }
  
  function litros(name: string){
    let gramas = /([0-9]+)(ml)/;
    let match =  name.match(gramas)
    if (match){
      return parseFloat(match[1])/1000
    }
  
    let kilos = /([0-9]+)(l)/;
    match =  name.match(kilos)
    if (match){
      return parseFloat(match[1])
    }
  
  
  }
  
  
  function metros(name: string){
    let metros = /([0-9,.]+)(m)/;
    let match =  name.match(metros)
    if (match){
      return parseFloat(match[1])
    }
  
    let cm = /([0-9,.]+)(cm)/;
    match =  name.match(cm)
    if (match){
      return parseFloat(match[1])/100
    }
  
  }
  
  
  function unidades(name: string){
    let unidades = /([0-9]+)(u)/;
    let match =  name.match(unidades)
    if (match){
      return parseInt(match[1])
    }
  
  
  
    let com = /c\/([0-9]+)/;
    match =  name.match(com)
    if (match){
      return parseFloat(match[1])
    }
  
  
    let leve = /lv?([0-9]+)/;
    match =  name.match(leve)
    if (match){
      return parseFloat(match[1])
    }
  
  
    let x = /x?([0-9]+)/;
    match =  name.match(x)
    if (match){
      return parseFloat(match[1])
    }
  
  
  }
  
  
  
  function compare(a,b) {
    if (a.amount_price < b.amount_price)
       return -1;
    if (a.attr > b.attr)
      return 1;
    return 0;
  }