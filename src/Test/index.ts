// Annotator.construct(
//     'Hello world!\nThis is great!',
//     document.getElementById('container')
// );

class A {
    c = new Map();

    constructor(
        public a: number,
        public b: string
    ) {
        this.c.set('a', 'a');
        this.c.set('b', 'b');
    }

    fuck() {
        console.log(this.a, this.b, this.c);
    }
}

let aa: A = new A(1, "Hello!");
aa.fuck();
console.log(aa);