const express = require('express');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const PORT = 8080;

app.use(express.json());

const productsRouter = express.Router();
app.use('/api/products', productsRouter);

productsRouter.get('/', async (req, res) => {
    try {
        const productsData = await fs.readFile('productos.json', 'utf8');
        const products = JSON.parse(productsData);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

productsRouter.get('/:pid', async (req, res) => {
    try {
        const productsData = await fs.readFile('productos.json', 'utf8');
        const products = JSON.parse(productsData);
        const productId = req.params.pid;
        const product = products.find(p => p.id === productId);
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

productsRouter.post('/', async (req, res) => {
    try {
        const newProduct = {
            id: uuidv4(),
            ...req.body
        };

        const productsData = await fs.readFile('productos.json', 'utf8');
        const products = JSON.parse(productsData);
        products.push(newProduct);
        
        await fs.writeFile('productos.json', JSON.stringify(products, null, 2));

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

productsRouter.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedFields = req.body;
        
        const productsData = await fs.readFile('productos.json', 'utf8');
        const products = JSON.parse(productsData);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...updatedFields };
            await fs.writeFile('productos.json', JSON.stringify(products, null, 2));
            res.json(products[productIndex]);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

productsRouter.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        
        const productsData = await fs.readFile('productos.json', 'utf8');
        let products = JSON.parse(productsData);
        products = products.filter(p => p.id !== productId);
        
        await fs.writeFile('productos.json', JSON.stringify(products, null, 2));

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// Rutas y lógica para carritos
const cartsRouter = express.Router();
app.use('/api/carts', cartsRouter);

cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = {
            id: uuidv4(),
            products: []
        };

        const cartsData = await fs.readFile('carrito.json', 'utf8');
        const carts = JSON.parse(cartsData);
        carts.push(newCart);
        
        await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2));

        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});


cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        
        const cartsData = await fs.readFile('carrito.json', 'utf8');
        const carts = JSON.parse(cartsData);
        const cart = carts.find(c => c.id === cartId);
        
        if (cart) {
            res.json(cart.products);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos del carrito' });
    }
});


cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;
        
        const cartsData = await fs.readFile('carrito.json', 'utf8');
        const carts = JSON.parse(cartsData);
        const cartIndex = carts.findIndex(c => c.id === cartId);
        
        if (cartIndex !== -1) {
            const cart = carts[cartIndex];
            const productToAdd = {
                productId,
                quantity
            };

            const existingProductIndex = cart.products.findIndex(p => p.productId === productId);

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push(productToAdd);
            }
            
            await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2));

            res.json(cart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
