import {feathers} from '@feathersjs/feathers';

// This is the interface for the message data
interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
}

class ProductService {
    products: Product[] = [];

    async find(): Promise<Product[]> {

        return this.products
    }

    async get(id: number): Promise<Product | null> {
        return this.products.find(product => product.id === id) || null
    }

    async create( data: Pick<Product, 'name' |'description'|'price'>){

        const product:Product = {
            id: this.products.length + 1,
            ...data
        }

        this.products.push(product);

        return product;

    }

    async remove(id: number): Promise<Product | null> {
        return this.products.splice(id)[0] || null
    }

}

// This tells TypeScript what services we are registering
type ServiceTypes = {
    products: ProductService,
}

const app = feathers<ServiceTypes>()

// Register the product service on the Feathers application
app.use('products', new ProductService())

// Log every time a new product has been created

app.service('products').on('created', (product: Product) => {
console.log('A new product has been created', product);
})

const main = async () => {
    // Create a new product on our product service
    await app.service('products').create({
      name: 'Product A',
      description: 'Read more information',
      price: 1000
    })
  
    // And another one
    await app.service('products').create({
        name: 'Product B',
        description: 'Read more information again',
        price: 5000
      })
  
    // Find all existing products
    const products = await app.service('products').find()
  
    console.log('All products', products)
  }

  main();