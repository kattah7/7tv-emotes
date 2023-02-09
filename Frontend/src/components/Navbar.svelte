<script lang="ts">
  import Poro from "../assets/Poros.webp";

  type Routes = {
    name: string;
    path: string;
  };

  let routes: Routes[] = [
    {
      name: "Site",
      path: "https://poros.lol",
    },
    {
      name: "Documentation",
      path: "https://docs.poros.lol/",
    },
    {
      name: "About",
      path: "https://github.com/kattah7/7tv-emotes",
    },
  ];
</script>

<nav>
  <div class="pfp-nav">
    <a href="/">
      <div class="poros-nav">
        <img src={Poro} alt="Poros Logo" />
        <span class="poros">Poros</span>
        <span class="lol">Lol</span>
      </div>
    </a>
  </div>
  <div>
    <input type="checkbox" id="menu-toggle" class="hidden" />
    <label class="hamburger" for="menu-toggle">
      <div class="bar" />
      <div class="bar" />
      <div class="bar" />
    </label>
    <ul>
      {#each routes as route}
        <li>
          <a href={route.path} target="_blank" rel="noopener noreferrer"
            >{route.name}</a
          >
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style lang="scss">
  $color-black: #1b1d22;
  $color-stv: #24dbf6;
  $color-blue: rgb(68, 138, 255);
  $color-white: white;

  nav {
    background-color: $color-black;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 50px;
    border-bottom: 4px solid $color-stv;
    animation: slideFromLeft 0.5s ease-in-out;

    &,
    & * {
      text-decoration: none;
      list-style-type: none;
      transition: all 0.3s ease-in-out;
    }

    @keyframes slideFromLeft {
      0% {
        transform: translateX(-2%);
      }
      100% {
        transform: translateX(0%);
      }
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }

  div.pfp-nav {
    img {
      height: 25px;
      width: 25px;
    }
  }

  div.poros-nav {
    display: flex;
    align-items: center;

    img {
      height: 35px;
      width: 35px;
      margin-right: 10px;
    }

    span {
      color: $color-white;
      font-size: 20px;
      font-weight: 550;

      &.lol {
        color: $color-stv;
      }
    }
  }

  ul {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
  }

  li {
    margin: 0 10px;

    a {
      color: $color-white;
      font-size: 14px;
      transition: all 0.3s ease-in-out;

      &:hover {
        color: $color-blue;
        font-weight: 550;
        border-radius: 50px;
        padding: 5px 10px;
        background-color: $color-white;
      }
    }
  }

  .hidden {
    display: none;
  }

  .hamburger {
    display: none;
  }

  @media (max-width: 768px) {
    nav {
      padding: 0 20px;
    }

    ul {
      display: none;
    }

    .hamburger {
      display: block;
      cursor: pointer;
    }

    li {
      a {
        &:hover {
          background-color: transparent;
        }
      }
    }

    .bar {
      width: 30px;
      height: 3px;
      margin: 6px 0;
      background-color: rgb(209, 209, 209);
      transition: 0.4s;
      border-radius: 5px;
    }

    #menu-toggle:checked ~ ul {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 40px;
      right: 0;
      background-color: $color-black;
      width: 100%;
      padding: 20px 0;
      border-bottom: 4px solid $color-stv;
      z-index: 1;
      animation: slideFromTop 0.5s ease-in-out;
      @keyframes slideFromTop {
        0% {
          transform: translateY(-2%);
        }
        100% {
          transform: translateY(0%);
        }
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    }

    #menu-toggle:checked ~ .hamburger .bar:nth-of-type(1) {
      transform: rotate(-45deg) translate(-6px, 6px);
    }

    #menu-toggle:checked ~ .hamburger .bar:nth-of-type(2) {
      opacity: 0;
    }

    #menu-toggle:checked ~ .hamburger .bar:nth-of-type(3) {
      transform: rotate(45deg) translate(-7px, -7px);
    }
  }
</style>
