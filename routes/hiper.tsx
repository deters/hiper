import { Handlers, PageProps } from "$fresh/server.ts";

interface Result {
  name: string;
  price: number;
  kg: number;
  l: number;
  m: number;
  un: number;
  amount: number;
  amount_price: number;
  image?: string;
}

export const handler: Handlers<Result | null> = {
  async GET(req, ctx) {
    //    const  query  = `PAO`;//ctx.params;

    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";

    const resp = await fetch(
      "https://search.osuper.com.br/ecommerce_products_production/_search",
      {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json",
        },
        "referrer": "https://hiperselect.com.br/",
        "body": JSON.stringify({
          accountId: 53,
          storeId: 153,
          categoryName: null,
          first: 100,
          "promotion": null,
          "after": null,
          search: query,
          brands: [],
          categories: [],
          tags: [],
          personas: [],
          sort: { "field": `pricing.price`, order: `desc` },
          pricingRange: {},
          highlightEnabled: true,
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit",
      },
    );

    let data = await resp.json();
    //console.log(data.edges)
    let lista = data.edges.map((edge) => edge.node)
      .map((node) => {
        return {
          name: node.name,
          price: node.pricing[0].promotionalPrice,
          kg: kilogramas(node.name+ ` `),
          l: litros(node.name+ ` `),
          m: metros(node.name+ ` `),
          un: unidades(node.name+ ` `),
          amount:
            (kilogramas(node.name+ ` `) || litros(node.name+ ` `) || metros(node.name+ ` `) ||
              1) * (unidades(node.name+ ` `) || 1),
          image: node.image,
        };
      })
      .map((node) => {
        return Object.assign({}, node, {
          amount_price: Math.round(node.price / (node.amount) * 100) / 100,
        });
      })
      .filter((p) => p.name.toUpperCase().startsWith(query))
      .sort(compare);

    console.log(lista);

    // if (resp.status === 404) {
    //   return ctx.render(null);
    // }
    //    const result: Result = await resp.json();

    //    console.log(result)

    const MOCK = [{
      "name": query,
      "price": 59.98,
      "amount": 1,
      "amount_price": 59.98,
    }, {
      "name": "Pao de queijo s/lactose kg",
      "price": 89.9,
      "amount": 1,
      "amount_price": 89.9,
    }];

    return ctx.render(lista);
  },
};

export default function Page({ data }: PageProps<Result[] | null>) {
  if (!data) {
    return <h1>User not found</h1>;
  }

  return (
    <>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossOrigin="anonymous"/>

      <div class="">
        <form class="form form-inline center">
          <input class="input" name="query" />
          <input class="default" type="submit" />
        </form>
      </div>

      <table class="table table-bordered">
        <tr>
          <td>
            Imagem
          </td>

          <td>
            Nome
          </td>

          <td>
            Preço
          </td>

          <td>
            Kg
          </td>

          <td>
            l
          </td>

          <td>
            m
          </td>

          <td>
            un
          </td>

          <td>
            Quantidade real
          </td>

          <td>
            Preço real
          </td>
        </tr>
        {data.map((item) => (
          <tr>
            <td>
              <img
                style="display: inline;"
                src={item.image}
                width={200}
                height={200}
              />
            </td>

            <td>
              <div style="display: inline; margin: 10px;">{item.name}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">{item.price}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">{item.kg}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">{item.l}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">{item.m}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">{item.un}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">{item.amount}</div>
            </td>

            <td>
              <div style="display: inline;  margin: 10px;">
                {item.amount_price}
              </div>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
}

function kilogramas(name: string) {
  let gramas = /([0-9]+)(g)/;
  let match = name.match(gramas);
  if (match) {
    return parseFloat(match[1]) / 1000;
  }

  let kilos = /([0-9]+)(kg)/;
  match = name.match(kilos);
  if (match) {
    return parseFloat(match[1]);
  }
}

function litros(name: string) {
  let mililitros = /([0-9]+)ml[ ]/;
  let match = name.match(mililitros);
  if (match) {
    return parseFloat(match[1]) / 1000;
  }

  let litros = /([0-9.,]+)(l)/;
  match = name.match(litros);
  if (match) {
    return parseFloat(match[1]);
  }
}

function metros(name: string) {
  let metros = /([0-9,.]+)m/;
  let match = name.match(metros);
  if (match) {
    return parseFloat(match[1]);
  }

  let cm = /([0-9,.]+)(cm)[ ]/;
  match = name.match(cm);
  if (match) {
    return parseFloat(match[1]) / 100;
  }
}

function unidades(name: string) {
  let unidades = /([0-9]+)u[n ]/;
  let match = name.match(unidades);
  if (match) {
    return parseInt(match[1]);
  }

  let com = /c\/([0-9]+)[ ]/;
  match = name.match(com);
  if (match) {
    return parseFloat(match[1]);
  }

  let leve = /lv?([0-9]+)[ ]/;
  match = name.match(leve);
  if (match) {
    return parseFloat(match[1]);
  }

  let x = /x([0-9]+)[ ]/;
  match = name.match(x);
  if (match) {
    return parseFloat(match[1]);
  }
}

function compare(a, b) {
  if (a.amount_price < b.amount_price) {
    return -1;
  }
  if (a.attr > b.attr) {
    return 1;
  }
  return 0;
}
