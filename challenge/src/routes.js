import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

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
            .end(JSON.stringify(tasks)); // http POST localhost:8888/tasks
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const created_at = new Date();
            const  { title, description, completed_at, updated_at } = req.body

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at,
                created_at,
                updated_at,
            }
    
            database.insert('tasks', task)
    
            return res.writeHead(201).end(); // http GET localhost:8888/tasks
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description, completed_at, created_at, updated_at } = req.body

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
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            database.delete('tasks', id)

            return res.writeHead(204).end()
        }
    }
]