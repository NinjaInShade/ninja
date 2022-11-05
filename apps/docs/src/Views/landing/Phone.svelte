<script lang="ts">
  let rotate = false;

  const toggleRotate = () => {
    rotate = !rotate;
  };
</script>

<div class="phone" style="--rotate: {rotate ? '-15deg' : '0deg'}">
  <svg width="100%" height="100%" viewBox="0 0 505 717" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="414" height="717" rx="27" fill="black" />
    <rect x="15" y="17" width="385" height="684" rx="27" fill="white" />
    <path d="M96 15L318 15V45C318 53.8366 310.837 61 302 61L112 61C103.163 61 96 53.8366 96 45V15Z" fill="black" />
    <rect x="112.853" y="118.922" width="190" height="37" rx="18.5" fill="#D9D9D9" class="placeholder-ui" />
    <rect x="50.853" y="241.922" width="314" height="219" rx="8" fill="#D9D9D9" class="placeholder-ui" />
    <rect x="172.853" y="163.922" width="71" height="37" rx="18.5" fill="#D9D9D9" class="placeholder-ui" />
    <rect x="109.853" y="583.922" width="45" height="45" rx="22.5" fill="#D9D9D9" class="placeholder-ui" />
    <rect x="261.853" y="583.922" width="45" height="45" rx="22.5" fill="#D9D9D9" class="placeholder-ui" />
    <g on:click={toggleRotate} on:keydown={toggleRotate}>
      <rect x="170.853" y="568.922" width="75" height="75" rx="37.5" fill="#D9D9D9" class="placeholder-ui" />
      <path
        d="M200.875 598.938C204.812 595.062 211.062 595.062 215 598.875L212.438 601.438C212 601.875 211.875 602.562 212.062 603.125C212.312 603.688 212.875 604 213.5 604H220.938H221.5C222.312 604 223 603.375 223 602.5V594.5C223 593.938 222.625 593.375 222.062 593.125C221.5 592.938 220.812 593.062 220.438 593.438L217.812 596.062C212.312 590.688 203.5 590.688 198.062 596.125C196.562 597.625 195.438 599.438 194.75 601.375C194.375 602.438 194.938 603.562 196 603.938C197 604.312 198.188 603.75 198.562 602.688C199 601.312 199.812 600.062 200.875 598.938ZM193 609.5V610V610.062V617.5C193 618.125 193.312 618.688 193.875 618.938C194.438 619.125 195.125 619 195.562 618.562L198.125 616C203.625 621.375 212.438 621.375 217.875 615.938C219.375 614.375 220.5 612.625 221.188 610.688C221.562 609.625 221 608.5 219.938 608.125C218.938 607.75 217.75 608.312 217.438 609.375C216.938 610.75 216.125 612 215.062 613.125C211.188 617 204.875 617 200.938 613.188L203.562 610.562C203.938 610.188 204.062 609.5 203.875 608.938C203.625 608.375 203.062 608 202.5 608H195H194.938H194.5C193.625 608 193 608.688 193 609.5Z"
        fill="#BFBFBF"
        class="placeholder-ui"
      />
    </g>
    <rect x="377.984" y="119.784" width="82" height="82" rx="41" transform="rotate(21.9433 377.984 119.784)" fill="white" />
    <rect x="382.969" y="131.495" width="65" height="65" rx="32.5" transform="rotate(21.9433 382.969 131.495)" fill="#0682F9" />
    <path
      d="M450.802 218.353C452.392 221.124 455.949 222.105 458.539 220.234C466.107 214.767 472.231 207.429 476.372 198.801C481.367 188.396 483.266 176.559 481.842 164.707C480.417 152.856 475.73 141.493 468.342 131.983C462.199 124.075 454.406 117.727 445.636 113.437C442.746 112.023 439.391 113.687 438.45 116.763V116.763C437.589 119.579 439.083 122.55 441.717 123.864C448.724 127.359 454.952 132.471 459.878 138.813C465.903 146.568 469.726 155.834 470.887 165.498C472.048 175.163 470.5 184.816 466.427 193.301C463.207 200.007 458.519 205.758 452.742 210.143C450.197 212.075 449.212 215.582 450.802 218.353V218.353Z"
      fill="#0682F9"
    />
  </svg>
</div>

<style>
  .phone {
    width: 100%;
    max-width: 505px;
    position: relative;
    transform: rotate(var(--rotate));
    margin-top: 90px;
  }

  .phone::before {
    content: '';
    position: absolute;
    border-bottom-left-radius: 32px;
    background-color: var(--grey-900);
    bottom: -16px;
    left: -22px;
    width: 50vw;
    height: 50%;
    z-index: -1;
  }

  .placeholder-ui {
    cursor: pointer;
    transition: fill 0.2s ease-in-out;
    animation: fadeIn 0.5s ease-in-out both;
    overflow: hidden;
    opacity: 0;
  }

  .placeholder-ui:hover {
    fill: hsl(0, 0%, 90%);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate3d(0, -5%, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
</style>
