import {app} from './app'
//@ts-ignore
app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`http start http://${process.env.HOST}:${process.env.PORT}/`)
})
