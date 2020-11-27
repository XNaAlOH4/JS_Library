function modulus(x) {
  return x < 0? -x:x;
}

function modular(x, mod) {
  return x < 0? (x+mod)%mod: x%mod;
}

function range(start, stop=null) {
  var list = [];
  if(stop == null) {
    for(let i = 0; i < start; i++) {
      list.push(i);
    }
    return list;
  }
  for(let i = start; i < stop; i++) {
    list.push(i);
  }
  return list;
}

function isIter(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

class SortingHandler {
  constructor(data) {
  	this.dlist = data;
  	this.choose();
  }

  choose() {
  	var len = this.dlist.length;
  	switch(true) {
  	  case len < 25:
  	  	this.bubble(len);
  	    break;
  	  case len < 250:
  	    this.quick(this.decide_partition());
  	    break;
  	  case len < 1000:
  	    this.radix(len);
  	    break;
  	}
  }

  async swap(array, data1, data2) {
  	let temp = JSON.parse(JSON.stringify(array[data1]));
  	array[data1] = array[data2];
  	array[data2] = temp;
  }

  bubble(len) {
  	for(let i = 0; i < len-1; i++) {
  	  for(let j = 0; j < len-i-1; j++) {// Loop through every element in data
  	    if(this.dlist[j] > this.dlist[j+1]) {
  	  	  swap(this.dlist, j, j+1);
  	    }
  	  }
  	}
  }

  async Lomuto_partition(array, start, end) {
  	let pivot = array[end];
  	for(let i = start; i < end; i++) {
  	  if(array[i] < pivot) {
  	  	await this.swap(array, start, i);
  	  	start += 1;
  	  }
  	}
  	await this.swap(array, start, end);
  	return start;
  }

  async Hoare_partition(array, start, end) {
  	const pivot = array[Math.floor((start+end)/2)];
  	while(true){// loop forever
  	  while(array[i] < pivot) {
  	  	start += 1;
  	  }
  	  while(array[j] > pivot) {
  	  	end -= 1;
  	  }
	  if(start >= end) {
	  	return end;
	  }
	  await this.swap(array, start, end);
  	}
  }

  decide_partition() {
  	
  }

  async quick(array=this.dlist, start=0, end=this.dlist.length, lomuto=true) {
  	if(start >= end) {
  	  return;
  	}
  	
  	if(lomuto) {
  	  const index = await this.Lomuto_partition(array, start, end);
  	  await Promise.all([
	  	this.quick(array, start, index-1),
	  	this.quick(array, index+1, end)
	  ]);
  	}else {
  	  const index = await this.Hoare_partition(array, start, end);
  	  await Promise.all([
	  	this.quick(array, start, index, false),
	  	this.quick(array, index+1, end, false)
	  ]);
  	}
  }
}

class Vector {
  constructor(x=0,y=0,z=0) {
  	this.x = x;
  	this.y = y;
  	this.z = z;
    this.type = "Vector";
  	if(isIter(x)){this.set(x);}
  }

  getAngle(other) {
    if(this.z != 0 || other.z != 0) {
      return null;
    }else {
      // The angle to rotate from this to other
      let dy = this.y-other.y, dx = this.x-other.x;
      if(dy >= 0 ) {
        if(dx >= 0) {
          return Math.atan(dy/dx);
        }else {
          return Math.PI + Math.atan(dy/dx);
        }
      }else {
        if(dx >= 0) {
          return Math.atan(dy/dx);
        }else {
          return -(Math.PI+Math.atan(dy/dx));
        }
      }
    }
  }

  add(vec,y,z) {
    switch(vec.x) {
      case null:
        this.x += vec;
        this.y += y;
        this.z += z;
        break;
      default:
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        break;
    }
  }

  sub(vec,y,z) {
    switch(vec.x) {
      case null:
        this.x -= vec;
        this.y -= y;
        this.z -= z;
        break;
      default:
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        break;
    }
  }

  mult(factor) {
    this.x = this.x * factor;
    this.y = this.y * factor;
    this.z = this.z * factor;
  }
  div(factor) {
    this.x = this.x / factor;
    this.y = this.y / factor;
    this.z = this.z / factor;
  }

  dot(vec) {
    let nVec = vec.unit;
    nVec.mult(this.mag());
    return nVec;
  }

  unit() {
    let x = this.x/this.mag();
    let y = this.y/this.mag();
    let z = this.z/this.mag();
    return new Vector(x,y,z);
  }

  mag() {
    return(Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z))
  }

  set(x,y,z) {
  	switch(isIter(x)) {
  	  case true:
  	    this.x = x.x;
        this.y = x.y;
        this.z = x.z;
        break;
      default:
        this.x = x;
        this.y = y;
        this.z = z;
        break;
  	}
  }

  copy(){
    return new Vector(this.x,this.y,this.z);
  }
}

class Line {
  constructor(pos, dir) {
    // point on line = (pos) + λ(dir)
    this.pos = pos? pos:new Vector();
    this.dir = dir? dir:new Vector(1,1,1);
    this.type = "Line";
  }

  angle(line, acute=true) {
    // line objects cannot check angle between itself and plane
    let top = this.dir.dot(line.dir);
    let bottom = this.dir.mag()* line.dir.mag();
    return acute? Math.acos(top/bottom) : Math.PI-Math.acos(top/bottom);
  }

  intersect(line) {
    //make the simultaneous equations
    let matrix = [[this.dir.x, line.dir.x],
    [this.dir.y, line.dir.y],[this.dir.z, line.dir.z]];
    let ans = line.pos.copy();
    ans.sub(this.pos);
    let solver = new Simul_Eqn(matrix, ans);
    return solver.solve();
  }

  cross() {

  }

  onLine(point) {
    let x = (point.x - this.pos.x) / this.dir.x;
    let y = (point.y - this.pos.y) / this.dir.y;
    let z = (point.z - this.pos.z) / this.dir.z;
    return (x == y) && (x == z);
  }

  footOfPerp() {
    
  }

}

class Plane {
  constructor(n, val) {
    // r = λ(pos) + μ(dir)
    // r * (n) = val
    this.n = n;
    this.val = val;
    this.type = "Plane";
  }

  getAngle(obj) {
    switch(obj.type) {
      case 'Line':

        break;
    }
  }
}

class Physics_Engine {
  constructor(pos, vel, acc) {
    this.pos = pos? pos:new Vector();
    this.vel = vel? vel:new Vector();
    this.acc = acc? acc:new Vector();
    this.enum = {pos:'pos',vel:'vel',acc:'acc'}
  }

  airRes() {
    //NO one really knows what the formula is
  }

  update(force=new Vector()) {
    this.acc.set(force.x,force.y,force.z);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  restrictMotion(plane) {

  }
}

class Matrix {
  constructor(width=0, height=null, initial=0) {
    // row (left to right)
    // column (top to bottom) 
    this.rows = [];
    switch(height) {
      case null:
        this.setAll(width);
        this.height = width.length;
        this.width = width[0].length;
        break;
      default:
        this.width = width;
        this.height = height;
        this.construct(initial);
        break;
    }
    this.square = (this.width == this.height);
  }

  construct(num) {
    for(let y = 0; y < this.height; y++) {
      // add arrays from top to bottom
      this.rows.push([]);
      for(let x = 0; x < this.width; x++) {
        //add values from left to right
        this.rows[y][x] = num;
      }
    }
  }

  set(row, values) {
    this.rows[row] = isIter(values)? [...values]:values;
  }

  setAll(values) {
      values.forEach((row, index) => {
        this.rows[index] = isIter(row)? [... row]:row;
      });
    //this.rows.forEach((row,index, array) => {array[index] = values[index]});
  }

  addRow(values, rowIndex=null) {
    let iterable = isIter(values[0]);
  	switch(rowIndex) {
  	  case null:// Add the values to every row
  	    for(let row in this.rows) {
          if(iterable) {
            values[row].forEach(function(val,i){this.rows[row][i] += val;});
          }else {
            this.rows[row] += values[row];
          }
        }
  	    break;
  	  default:// Add the values to a specific row
        this.rows[rowIndex];
  	    break;
  	}
  	switch(true) {
  	  case this.width < 1:
  	    this.rows.forEach()
  	    break;
  	  default:
  	    this.rows.forEach((row, index, array) => {array[index].forEach();});
  	    break;
  	}
    
  }

  multRow(row_, factor) {
    this.rows[row_].forEach((row,index,array) => {array[index] *= factor});
  }

  listBlanks() {
    let blanks = [];
    this.rows.forEach((row,index) => {
      let dict = [];
      row.forEach((num,index) => {
        if(num == 0) {dict.push(index);}
      });
      blanks.push(dict);
    });
    return blanks;
  }

  swapRow(index1, index2) {
    let copy = this.rows[index1];
    this.rows[index1] = this.rows[index2];
    this.rows[index2] = copy;
  }

  getRow(row=0, exclude=null) {
    return this.exclude(this.rows[row].slice(), exclude);
  }

  getColumn(column=0, exclude=null) {
    let columns = [];
    this.rows.forEach(array => {columns.push(array[column])});
    return columns;
  }

  exclude(array, column=0) {
    if(column == null) {
      return array;
    }
    let copy = [...array];
    // console.log(copy, this.width);
    copy.splice(column,1);
    return copy;
  }

  identity() {
    if(!this.square) {
      console.log("Not square bro");
      return null;
    }
    let I = new Matrix(this.height, this.width);
    for(let i = 0; i < this.height; i++) {
      I.rows[i][i] = 1;
    }
    return I;
  }

  determinant() {
    // If matrix is 1 x 1
    if(this.width < 2) {
      return this.rows[0][0];
    }
    // Get Determinant of 2 x 2 Matrix
    return this.rows[0][0]*this.rows[1][1] - this.rows[1][0]*this.rows[0][1];
  }

  isDegenerate() {
    // I could've been smarter about this because truthiness is a thing
    // Meaning anything that is not 0, null or undefined is true 
    this.determinant();
  }

  lapExp() {// get determinant using Laplace Expansion
    //this is tedious as shit lol
    if(this.square) {
      if(this.width == 2) {
        return this.determinant();
      }
      var matrices = [];
      for(let i in this.rows[0]) {
        matrices.push(new Matrix(this.width-1, this.height-1));
        for(let j = 1; j < this.height; j++) {
          matrices[i].set(j-1, this.getRow(j, i));
        }
      }
      var determinant = 0;
      var even_odd = {0:1,1:-1}
      matrices.forEach((matrix,index) => {
        determinant += even_odd[index%2]*this.rows[0][index]*matrix.lapExp();
      });
      return determinant;
    }else {console.log("Not a square lol");return null;}
  }

  inverse() {// inverse using row reduced echelon form
    // First, check if determinant is 0
    let det = this.lapExp();
    if(det == 0) {
      return;
    }
    let temp = this.copy();
    // [A] [B] [C] | [1] [0] [0]
    // [D] [E] [F] | [0] [1] [0]
    // [G] [H] [I] | [0] [0] [1]
    let I = this.identity();
    // finish off all the bottoms first
    for(let j = 0; j < this.width; j++) {
      temp.multRow(j, 1/temp.rows[j][j]); I.multRow(j, 1/temp.rows[j][j]);
      for(let i = j; i < this.height+j; i++) {
        let temp_row = new Matrix(temp.getRow(i).slice()); let temp_2row = new Matrix(I.getRow(i).slice());
        temp_row.multRow(i, temp.rows[(i+1)%this.width][j]); 
        temp_2row.multRow(i, I.rows[(i+1)%this.width][j]);
        temp.addRow(temp_row); I.addRow(temp_2row);
      }
    }
    temp.print();
    //return I;
  }

  transpose() {
    let rows = [];
    for(let i = 0; i < this.height; i++) {
      rows.push(this.getColumn(i));
    }
    let A = new Matrix(this.height, this.width);
    A.setAll(rows);
    return A;
  }

  CrissCross() {// Getting Area of a polygon
    let positives = 0, negatives = 0;

    for(let i = 0; i < this.width; i++) {
      let multiple_1 = 1, multiple_2 = 1;
      for(let j = 0; j < this.height; j++) {
        multiple_1 *= this.rows[j][(i+j)%3];
        multiple_2 *= this.rows[j][modular(i-j,3)];
      }
      positives += multiple_1;
      negatives += multiple_2;
    }
    return positives-negatives;
  }

  eigenVec() {

  }

  eigenVal() {

  }

  print() {
    // column.forEach(
    console.table(this.rows);
  }

  copy() {
    // let rows = [... this.rows];
    let copy = new Matrix(this.width, this.height);
    copy.setAll([... this.rows]);
    return copy;
  }
}

class Simul_Eqn {
  constructor(matrix, ans) {
    this.matrix = new Matrix(matrix);
    this.ans = new Matrix(ans)
  }

  solve() {
    // First, sort the rows such that all the numbers in the 
    // top-left to bottom-right diagonal are not 0
    let temp = this.matrix.giveSort();
    // [A] [B] [C] | [1] [0] [0]
    // [D] [E] [F] | [0] [1] [0]
    // [G] [H] [I] | [0] [0] [1]
    for(let j = 0; j < this.width; j++) {
      temp.multRow(j, 1/temp.row[j][j]); this.ans.multRow(j, 1/temp.row[j][j]);
      for(let i = 0; i < this.height-1; i++) {
        let temp_row = temp.getRow(i).slice(); let temp_2row = this.ans.getRow(i).slice();
        temp_row.multRow(i, temp.rows[i+1][j]); temp_2row.multRow(i, this.ans.rows[i+1][j]);
        temp.addRow(temp_row); this.ans.addRow(temp_2row);
      }
    }
    console.log(temp);
    return this.ans;
  }
}