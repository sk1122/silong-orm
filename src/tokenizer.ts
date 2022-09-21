import { readFile, writeFile } from "fs/promises";

const AST: any = {
	prog: "Database",
	tables: []
}

const main = async () => {
	const keywords = ["table"]
	const file = (await readFile("./db/a.orm")).toString()

	let pos = 0, row = 0, col = 0

	let table = true, tableIndex = 0, variables = false

	for(let i = 0; i < file.length; i++) {
		if(file[i] == '}') {
			table = false
			variables = false
		}
		if(file[i] == '\n') {row++, col = 0; continue}
		if(file[i] == ' ') {col++, pos++; continue}

		const value = keywords.find((v) => v[0] === file[i])

		if(value) {
			if(value == file.substr(i, value.length)) {
				const a = AST.tables.push({
					type: "table"
				})

				tableIndex = a - 1

				i += value.length
				pos += i
				table = true

				continue
			}
		}

		if(table && !Object.keys(AST.tables[tableIndex]).includes("name") && file[i] != ' ') {
			let tableName = ""

			for(let j = i; j < file.length; j++) {
				if(file[j] === ' ') {
					i += (j - i)
					break
				}
				tableName += file[j]
			}

			AST.tables[tableIndex].name = tableName
		}

		if(table && file[i] == '{') {
			variables = true
			AST.tables[tableIndex].variables = []
			for(let j = i; j < file.length; j++) {
				if(file[j] != ' ' && file[j] != '{' && file[j] != '\n') {
					break
				}

				i++
			}
		}

		if(variables && file[i] != ' ' && file[i] != '\n') {
			let colon = false
			let variableName = '', type = ''
			let breaked = false
			let attributes: any[] = []
			for(let j = i; j < file.length; j++) {
				if(file[j] == '\n') {
					let k = j
					for(k < file.length; k++;) {
						if(file[k] == '\n' || file[k] == '}') break
					}
					i += (k - i)
					break
				}
				
				if(file[j] == '@') {
					let k = j - 1; 
					console.log(j, k, "jk")
					for(k < file.length; ++k;) {
						console.log(j, k, "jk1")
						if(file[k] == '\n' || file[k] == '}') break
						if(file[k] == '@') continue

						let a = {
							name: "",
							value: ""
						}
						let name = true

						let x = k - 1;
						
						console.log(x, j, k, "xjk")
						for(x < file.length; x++;) {
							console.log(x, j, k, "xjk1")
							if(file[x] == '@' || file[i] == ' ') continue
							if(file[x] == '(') {
								name = false
								continue
							}

							if(name) {
								a.name += file[x]
							} else {
								if(file[x] == ')') break
								a.value += file[x]
							}
						}

						attributes.push(a)

						k += (x - k)
					}

					i += (k - i)
					
					// let k = j
					// let a = {
					// 	name: "",
					// 	value: ""
					// }
					// console.log(a, "A")
					// let name = true
					// for(k < file.length; k++;) {
					// 	if(file[k] == ' ' || file[k] == '\n' || file[k] == '}') break

					// 	if(file[k] == '(') {
					// 		name = false
					// 		continue
					// 	}
					// 	if(name) a.name += file[k]
					// 	else {
					// 		if(file[k] != ')') a.value += file[k]
					// 	}
					// }
					// console.log(a)
					// attributes.push(a)
					// i += (k - i)
					// // console.log(i, file[i])
					// break
				}
				
				if(breaked || file[j] == '\n' || file[j] == '{' || file[j] == '}') {
					i += (j - i)
					break
				}

				if(file[j] == ':') {
					colon = true
					continue
				}
				
				if(file[j] == ' ') {
					continue
				}
				
				if(colon) {
					for(let k = j; k < file.length; k++) {
						if(file[k] == ' ' || file[k] == '\n' || file[k] == '\t') {
							breaked = true
							j += (k - j)
							break
						}
						
						type += file[k]
					}
				}

				if(!colon) {
					variableName += file[j]
				}
			}
			AST.tables[tableIndex].variables.push({
				name: variableName,
				type: type,
				attributes: attributes
			})
		}
		pos++
	}
}

main()
	.then(A => writeFile("./db/a.json", JSON.stringify(AST)))
	.catch(e => console.log(e))