<script lang="ts">
  import Github from "../assets/github.svg";
  import Twitch from "../assets/twitch.avif";
  import Twitter from "../assets/twitter.avif";

  type Socials = {
    name: string;
    path: string;
    image: string;
  };

  let Footers: Socials[] = [
    {
      name: "Github",
      path: "https://github.com/kattah7",
      image: Github,
    },
    {
      name: "Twitch",
      path: "https://twitch.tv/kattah",
      image: Twitch,
    },
    {
      name: "Twitter",
      path: "https://twitter.com/katt3h",
      image: Twitter,
    },
  ];
</script>

<footer>
  <div class="copyright">
    <p class="copyright-year">&copy; {new Date().getFullYear()} Kattah</p>
    <p>Not affiliated with Twitch or 7TV in any way</p>
    <p>All rights reserved.</p>
  </div>
  <div class="contact">
    <p class="contact">Contact</p>
    {#each Footers as footer}
      <a href={footer.path} target="_blank" rel="noopener noreferrer">
        <img src={footer.image} alt={footer.name} />
      </a>
    {/each}
  </div>
</footer>

<style lang="scss">
  footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    background-color: #333;
    color: #fff;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  div.contact {
    img {
      height: 25px;
      width: 25px;
      margin-right: 1rem;
    }

    img[alt="Twitter"] {
      width: 30px;
    }
  }

  p.contact {
    margin: 0;
    margin-right: 1rem;
    font-weight: 550;
    margin-bottom: 1.3rem;

    @media (max-width: 768px) {
      margin-bottom: 1rem;
      text-align: center;
    }
  }

  .copyright {
    color: rgb(150, 148, 148);
    margin-right: 10%;
    p {
      margin: 5px;

      &.copyright-year {
        margin-bottom: 1rem;
      }
    }

    @media (max-width: 768px) {
      margin-bottom: 1rem;
      margin-right: 0%;
      p {
        margin: 0;
        text-align: center;
      }
    }
  }

  a {
    color: #fff;
    text-decoration: none;
  }
</style>
