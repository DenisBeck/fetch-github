window.addEventListener('DOMContentLoaded', function () {
    const inputField = document.querySelector('.search__input');
    const errorMessage = document.querySelector('.search__error');
    const autocompleteList = document.querySelector('.search__list');
    const mainList = document.querySelector('.main__list');

    const repos = [];

    const debounceFetch = (delay, callback) => {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => { callback.apply(this, args) }, delay)
        }
    }

    function removeRepo ({ name, ownerName, stargazers_count }) {
        const index = repos.indexOf(repos.find(item => item.name === name && item.ownerName === ownerName && item.stargazers_count === stargazers_count));
        repos.splice(index, 1)
        renderMainList();
    }

    function addRepo ({ name, owner, stargazers_count }) {
        const ownerName = owner.login;
        repos.push({ name, ownerName, stargazers_count});
        renderMainList();
    }

    async function clearSearchFields () {
        autocompleteList.innerHTML = '';
        errorMessage.innerHTML = '';
    }

    async function clearAllFields () {
        await clearSearchFields();
        inputField.value = '';
        mainList.innerHTML = '';
    }

    async function getRepoNames (event) {
        const repoQuery = event.target.value;
        if (!repoQuery) {
            return;
        }
        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${repoQuery}&per_page=5`)
            if(!response.ok) {
                throw new Error('Невозможно получить данные')
            }
            const data = await response.json();
            return data.items;
        } catch(error) {
            throw error;
        }
    }

    async function renderReposList (e) {
        await clearSearchFields();
        try {
            const names = await getRepoNames(e);
            if (!names) {
                return;
            }
            const fragment = document.createDocumentFragment();
            names.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('search__item');
                const link = document.createElement('a');
                link.setAttribute('href', '#');
                link.classList.add('search__link');
                link.addEventListener('click', () => addRepo(item));
                link.textContent = item.name;
                li.append(link);
                fragment.append(li);
            })
            autocompleteList.append(fragment);
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    }

    async function renderMainList () {
        await clearSearchFields();
        await clearAllFields();
        const fragment = document.createDocumentFragment();
        
        repos.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('main__item');
            li.classList.add('item');

            const div = document.createElement('div');

            const spanName = document.createElement('span')
            spanName.classList.add('item__text');
            spanName.textContent = `Name: ${item.name}`;
            div.append(spanName);

            const spanOwner = document.createElement('span')
            spanOwner.classList.add('item__text');
            spanOwner.textContent = `Owner: ${item.ownerName}`;
            div.append(spanOwner);

            const spanStars = document.createElement('span')
            spanStars.classList.add('item__text');
            spanStars.textContent = `Stars: ${item.stargazers_count}`;
            div.append(spanStars);

            li.append(div);
            
            const button = document.createElement('button');
            button.classList.add('item__close');
            button.addEventListener('click', () => removeRepo(item))
            li.append(button);

            fragment.prepend(li);
        })
        

        mainList.append(fragment);
    }

    const debounced = debounceFetch(500, renderReposList);

    inputField.addEventListener('input', debounced);
    autocompleteList.addEventListener('click', function (e) {
        e.preventDefault();
    })
})