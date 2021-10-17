// @ts-check
import express from 'express'
import fs from 'fs'

const app = express()
const port = 8080

app.get('/getglobalinfo', cors(serveJsonFile('./GlobalModelAttributes.json')))
app.get('/listprojects', cors(serveJsonFile('./Projects.json')))

app.get(
    '/loadproject',
    cors(async (req, res, next) => {
        const projectName = req.query.projectname

        if (!projectName) return next(new Error('Must select a project.'))

        const planningProject = await getJson(`./Demo/planningProjects/${projectName}.project.json`)
        const { configRef, modelRef } = planningProject.projectInfo
        const [configuration, interfaceModel] = await Promise.all([
            getJson(`./Demo/configurations/${configRef}.json`),
            getJson(`./Demo/interfaceModels/${modelRef}.json`),
        ])

        res.send({ planningProject, configuration, interfaceModel })
    }),
)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function cors(fn) {
    return function(req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:9000') // update to match the domain you will make the request from
        fn(req, res, next)
    }
}

function serveJsonFile(file) {
    return async function(req, res, next) {
        let buffer

        try {
            buffer = await fs.promises.readFile(file)
        } catch (e) {
            debugger
            return next(e)
        }

        res.send(buffer)
    }
}

async function getJson(file) {
    const buffer = await fs.promises.readFile(file)
    return JSON.parse(buffer.toString())
}
