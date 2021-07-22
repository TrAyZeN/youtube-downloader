<script>
    import ProgressBar from './ProgressBar.svelte';

    const states = {
        downloading: 0,
        downloaded: 1,
        error: 2,
    };

    const focus = node => node.focus();
    let url = '';
    let eventSource = null;
    let progress = 0;
    let state = null;
    let result = null;

    function convert() {
        if (eventSource != null) {
            return;
        }

        eventSource = new EventSource(
            `/api/convert?url=${encodeURIComponent(url)}&format=mp3`
        );

        eventSource.addEventListener('message', (_) => {
            progress = 0;
            state = states.downloading;
        });

        eventSource.addEventListener('progress', (e) => {
            progress = Math.floor(JSON.parse(e.data).progress * 100);
        });

        eventSource.addEventListener('done', (e) => {
            progress = 100;
            eventSource.close();
            eventSource = null;
            state = states.downloaded;
            result = JSON.parse(e.data);
        });

        eventSource.addEventListener('error', (e) => {
            console.log(e);
            eventSource.close();
            eventSource = null;
            state = states.error;
        });
    }

    function download() {
        window.location.href += `api/download?file=${result.filename}&title=${result.videotitle}`;
    }
</script>

<main>
    <h1>Youtube Downloader</h1>
    <form action="#" on:submit={convert}>
        <input
            bind:value={url}
            use:focus
            type="text"
            placeholder="Enter the url of the video you want to download"
        >

        {#if state !== states.downloaded}
            <button type="submit">Convert</button>
        {/if}
    </form>

    {#if state === states.downloaded}
        <button on:click={download}>Download</button>
    {/if}

    {#if state === states.downloading}
        <div class="progress">
            <ProgressBar progress={progress} barColor='#eeeeee' containerColor='#1a2326' />
            <div class="progress-text">
                <p>Downloading...</p>
                <p>{progress}%</p>
            </div>
        </div>
    {/if}
</main>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;600&display=swap');

    $primary: #eeeeee;
    $secondary: #1a2326;

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
        font-family: 'Rubik', sans-serif;
    }

    h1 {
        font-size: 38pt;
        color: $secondary;
        margin: 8rem;
    }

    input {
        padding: 18px;
        outline: none;
        border: none;
        border-radius: 50px;
        font-size: 16pt;
        width: 800px;
        margin: 1rem;
    }

    button {
        background-color: $secondary;
        color: $primary;
        border-radius: 18px;
        font-weight: 600;
        padding: 16px;
        font-size: 16pt;
        margin: 4px;
        transition: 0.2s;
        cursor: pointer;
    }

    button:hover {
        padding: 20px;
        margin: 0px;
    }

    .progress {
        margin: 20px;
        margin-top: 6rem;

        .progress-text {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;

            p {
                margin: 0;
                margin-top: 10px;
            }
        }
    }


    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
