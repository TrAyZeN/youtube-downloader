<script>
    // Progress of the bar in percent
    export let progress;
    // Color of the bar
    export let barColor = "green";
    // Color of the container
    export let containerColor = "red";
    // Border radius in pixel
    export let radius = 50;
</script>

<main style="
    background-color: {containerColor};
    border-radius: {radius}px
">
    <div class="bar" style="
        width: {progress}%;
        background-color: {barColor};
        border-radius: {radius}px;
    ">
    </div>
</main>

<style lang="scss">
    main {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        height: 40px;
        width: 500px;
        padding: 0 5px;

        .bar {
            height: 30px;
            width: 0;
        }
    }
</style>
