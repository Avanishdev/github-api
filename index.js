require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

const corsOptions = {
    origin: ['https://avanish-portfolio-site.netlify.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(express.json());
app.use(cors(corsOptions));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
    },
});

app.get('/', (req, res) => {
    res.json("Welcome, - by Avanishdev.")
})

// GET /github - Fetch user data and repositories
app.get('/github', async (req, res) => {
    try {
        const userResponse = await githubApi.get(`/users/${GITHUB_USERNAME}`);
        const userData = userResponse.data;

        const reposResponse = await githubApi.get(`/users/${GITHUB_USERNAME}/repos`);
        const repos = reposResponse.data.map(repo => ({
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
        }));

        const response = {
            followers: userData.followers,
            following: userData.following,
            publicRepos: userData.public_repos,
            repositories: repos,
        };
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch GitHub data' });
    }
});

// GET /github/:username - Fetch user data and repositories for a specific user
// app.get('/github/:username', async (req, res) => {
//     const username = req.params.username

//     try {
//         const userResponse = await githubApi.get(`/users/${username}`);
//         const userData = userResponse.data;

//         const reposResponse = await githubApi.get(`/users/${username}/repos`);
//         const repos = reposResponse.data.map(repo => ({
//             name: repo.name,
//             description: repo.description,
//             url: repo.html_url,
//             stars: repo.stargazers_count,
//             forks: repo.forks_count,
//         }));

//         const response = {
//             username: userData.login,
//             followers: userData.followers,
//             following: userData.following,
//             publicRepos: userData.public_repos,
//             repositories: repos,
//         };
//         res.json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to fetch GitHub data' });
//     }
// });

// GET /github/{repo-name} - Fetch specific repo data
app.get('/github/:repoName', async (req, res) => {
    const { repoName } = req.params;
    try {
        const repoResponse = await githubApi.get(`/repos/${GITHUB_USERNAME}/${repoName}`);
        const repoData = repoResponse.data;

        const response = {
            name: repoData.name,
            description: repoData.description,
            url: repoData.html_url,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            created_at: repoData.created_at,
            updated_at: repoData.updated_at,
        };
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Repository not found or access denied' });
    }
});

// // GET /github/:username/:repoName - Fetch specific repo data for a given user
// app.get('/github/:username/:repoName', async (req, res) => {
//     const { username, repoName } = req.params;

//     try {
//         const repoResponse = await githubApi.get(`/repos/${username}/${repoName}`);
//         const repoData = repoResponse.data;

//         const response = {
//             name: repoData.name,
//             description: repoData.description,
//             url: repoData.html_url,
//             stars: repoData.stargazers_count,
//             forks: repoData.forks_count,
//             created_at: repoData.created_at,
//             updated_at: repoData.updated_at,
//         };
//         res.json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(404).json({ error: 'Repository not found or access denied' });
//     }
// });

// POST /github/{repo-name}/issues - Create an issue in the repo
app.post('/github/:repoName/issues', async (req, res) => {
    const { repoName } = req.params;
    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    try {
        const issueResponse = await githubApi.post(
            `/repos/${GITHUB_USERNAME}/${repoName}/issues`,
            { title, body }
        );
        const issueUrl = issueResponse.data.html_url;
        res.json({ issueUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create issue' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
})

module.exports = app;