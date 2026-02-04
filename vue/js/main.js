// let product = "Socks"
let app = new Vue({
    el: '#app',
    data: {
        product: "Socks",
        image: "./assets/vmSocks-green-onWhite.jpg",
        // image: "./assets/vmSocks-blue-onWhite.jpg",
        altText: 'A pair of socks',
        inStock: true,
        details: ['80% cotton', '20% polyster', 'Gender-neutral'],
        variants: [
            {
                variantId: 1111,
                variantColor: 'green',
                variantImage: './assets/vmSocks-green-onWhite.jpg',
            },
            {
                variantId: 1112,
                variantColor: 'blue',
                variantImage: './assets/vmSocks-blue-onWhite.jpg',
            }
        ],
        cart: 0,
    },
    methods: {
        addToCart(){
            this.cart += 1
        },
        deleteFromCart(){
            if(this.cart >= 1){
                this.cart -= 1
            }
        },
        updateProduct(variantImage){
            this.image = variantImage
        }
    },
    
})