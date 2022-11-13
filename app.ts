import {feathers} from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import { koa, rest, bodyParser, errorHandler, serveStatic } from '@feathersjs/koa'

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

const app = koa<ServiceTypes>(feathers())

/** Middleware */
// Use the current folder for static file hosting
app.use(serveStatic('.'))
// Register the error handle
app.use(errorHandler())
// Parse JSON request bodies
app.use(bodyParser())

/** Feathers transport */
// app.configure calls set up the Feathers transport to host the API
// Register REST service handler
app.configure(rest());
// Configure Socket.io real-time APIs
app.configure(socketio());

// Register the product service on the Feathers application
app.use('products', new ProductService())


// Add any new real-time connection to the `everybody` channel
app.on('connection', (connection) => app.channel('everybody').join(connection));
// Publish all events to the `everybody` channel
app.publish((_data) => app.channel('everybody'));
/**
app.service('products').on('created', (product: Product) => {
console.log('A new product has been created', product);
})
*/

// const main = async () => {
//     // Create a new product on our product service
//     await app.service('products').create({
//       name: 'Product A',
//       description: 'Read more information',
//       price: 1000
//     })
//
//     // And another one
//     await app.service('products').create({
//         name: 'Product B',
//         description: 'Read more information again',
//         price: 5000
//       })
//
//     // Find all existing products
//     const products = await app.service('products').find()
//
//     console.log('All products', products)
//   }
//
//   main();

// Start the server
app.listen(3030).then(() => console.log('Feathers server listening on localhost:3030'))

// For good measure let's create a product
// So our API doesn't look so empty
app.service('products').create({
    name: 'Product A',
    description: 'Read more information',
    price: 1000
}).then(console.log)