import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';
import { parse } from 'csv';
import { multer } from 'multer'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
import fs from 'node:fs/promises'

const database = new Database

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
                completed_at: search,
                created_at: search,
                updated_at: search,
            } : null)

            return res
            .setHeader('Content-type', 'application/json')
            .end(JSON.stringify(tasks));
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const created_at = new Date();
            const  { title, description } = req.body
            const completed_at = null, updated_at = null;

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at,
                created_at,
                updated_at,
            }

            database.insert('tasks', task)
    
            return res.writeHead(201).end();
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body
            const selectededValues = database.select('tasks', {id});
            const completed_at = selectededValues[0].completed_at, created_at = selectededValues[0].created_at, updated_at = new Date();

            database.update('tasks', id, {
                title,
                description,
                completed_at,
                created_at,
                updated_at,
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks/invite'),
        handler: async (req, res) => { 
            
            upload.single('file');
            console.log('req.body:', req, req.file)

            const content = await fs.readFile(file);

            console.log('content', content);

            const records = parse(content, {bom: true});
            
            console.log('records',records)
            
            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params
            const completed_at = new Date(), updated_at = new Date();

            database.update('tasks', id, {
                completed_at,
                updated_at,
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            database.delete('tasks', id)

            return res.writeHead(204).end()
        }
    }
]