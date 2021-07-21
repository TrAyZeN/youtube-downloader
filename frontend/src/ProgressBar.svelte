<script>
    // Progress of the bar in percent
    export let progress;
    // Color of the bar
    export let barColor = "green";
    // Color of the container
    export let containerColor = "red";
    // Border radius in pixel
    export let radius = 6;
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

<style>
    main {
        height: 20px;
    }

    .bar {
        height: 100%;
    }
</style>
