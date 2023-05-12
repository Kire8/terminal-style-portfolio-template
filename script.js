const unicodes = {
    line: String.fromCharCode(parseInt("+2590", 16)),
    space: String.fromCharCode(parseInt("+2009", 16)),
  };
  let text = `> ${unicodes.line} Quick tips: Ctrl+C - to skip, Ctrl+R - restart terminal \n> ${unicodes.line} About me: \n> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque id nibh a eros pellentesque efficitur. Vivamus ipsum justo, elementum pulvinar dui non, aliquam egestas erat. Phasellus consequat eros et finibus molestie. Sed et odio quis ipsum condimentum lobortis eget et nunc. Nunc dolor ex, bibendum vel placerat in, tincidunt quis sapien. Nunc molestie ex et mauris vulputate ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam sed consequat purus. Phasellus convallis vel nisi id aliquet \n> ${unicodes.line} Commands: projects, contact <<< use the command to activate you also can execute any JS script \n > ${unicodes.line}`;
  let timer = undefined;
  let finished = false;
  let list = false;
  let new_win = undefined;
  
  const screen_element = document.getElementById("screen");
  function commands_runner_create() {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.id = "commands_runner";
    document.body.appendChild(iframe);
    new_win = iframe.contentWindow;
    new_win.console.log = new Proxy(new_win.console.log, {
      apply(target, _this, args) {
        screen_element.textContent += stringify(args[0]) + "\n>  ";
        return target.apply(_this, args);
      },
    });
    delete new_win.caches;
    ///  document.body.removeChild(iframe);
  }
  commands_runner_create();
  function write() {
    finished = false;
    document.body.classList.add("disabled_select");
    document.addEventListener("keyup", skip);
    timer = setInterval(() => {
      screen_element.textContent += text[screen_element.textContent.length];
      if (text[screen_element.textContent.length - 1] === unicodes.line) {
        screen_element.textContent = screen_element.textContent.replace(
          unicodes.line,
          " "
        );
        line_create();
        clearInterval(timer);
        if (screen_element.textContent.length < text.length) {
          timer = setTimeout(() => {
            document.getElementById("line")?.remove();
            write();
          }, 1000);
        }
      }
      if (screen_element.textContent.length === text.length) {
        clearInterval(timer);
        finished = true;
        document.body.classList.remove("disabled_select");
      }
    }, 55);
  }
  write();
  
  document.addEventListener("keyup", skip);
  document.addEventListener("keydown", type);
  /*
  document.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
    if (!finished || list) return;
    try {
      screen_element.textContent += (
        await navigator.clipboard.readText()
      ).replace(/\n/gi, " ");
    } catch (err) {
      screen_element.textContent += " " + err + "\n> ";
    }
    line_create();
  });
  */
  function skip(e) {
    if (e.keyCode === 67 && e.ctrlKey) {
      document.removeEventListener("keyup", skip);
      clearTimeout(timer);
      clearInterval(timer);
      screen_element.textContent = text.replaceAll(unicodes.line, "");
      if (!list) line_create();
      finished = true;
      document.body.classList.remove("disabled_select");
    }
  }
  
  async function type(e) {
    e.preventDefault();
    if (!finished || list) return;
    const line_element = document.getElementById("line");
    if (e.keyCode === 37 || e.keyCode == 39) return line_move(e.keyCode);
    switch (e.keyCode) {
      case 8:
        {
          if (
            screen_element.textContent.endsWith("> ") ||
            screen_element.textContent
              .slice(0, -line_element.textContent.length)
              .endsWith("> ")
          )
            return;
          if (line_element.textContent) {
            screen_element.textContent = screen_element.textContent.slice(
              0,
              -(line_element.textContent.length + 1)
            );
            return line_create(line_element.textContent);
          } else {
            screen_element.textContent = screen_element.textContent.slice(0, -1);
          }
        }
        break;
      case 13:
        {
          command_check(screen_element.textContent);
          window.scrollTo(0, document.body.scrollHeight);
        }
        break;
      case 32:
        {
          if (line_element.textContent) {
            screen_element.textContent =
              screen_element.textContent.slice(
                0,
                -line_element.textContent.length
              ) + unicodes.space;
            return line_create(line_element.textContent);
          }
          screen_element.textContent += unicodes.space;
        }
        break;
      default:
        {
          if (e.ctrlKey && e.key === "r") {
            return restart();
          } else if (e.ctrlKey && e.key === "v") {
            if (!finished || list) return;
            try {
              screen_element.textContent += (
                await navigator.clipboard.readText()
              ).replace(/\n| /gi, unicodes.space);
            } catch (err) {
              screen_element.textContent += " " + err + "\n> ";
            }
            line_create();
          }
          if (e.key.length > 1 || e.ctrlKey) return;
          if (line_element.textContent) {
            screen_element.textContent =
              screen_element.textContent.slice(
                0,
                -line_element.textContent.length
              ) + e.key;
            return line_create(line_element.textContent);
          }
          screen_element.textContent += e.key;
        }
        break;
    }
    line_create();
  }
  
  function line_create(line) {
    screen_element.append(
      Object.assign(document.createElement("span"), {
        id: "line",
        className: "line",
        textContent: line ?? "",
      })
    );
  }
  
  function command_check(command) {
    const original_command = command
      .split(" ")
      .at(-1)
      .replace(new RegExp(unicodes.space+"{1,}", "gi"), " ");
    command = command
      .split(" ")
      .at(-1)
      .replace(new RegExp(unicodes.space + "| |\n", "gi"), "");
    screen_element.textContent += "\n> ";
    if (!command) return;
    switch (command) {
      case "projects":
        {
          text =
            screen_element.textContent +
            unicodes.line +
            " Projects: <<< use arrows and enter \n> project 1\nㅤproject 2\nㅤproject 3\nㅤClose";
          write();
          list = true;
          document.addEventListener("keyup", list_control);
        }
        break;
      case "contact":
        {
          text =
            screen_element.textContent +
            unicodes.line +
            " Contact: \n Discord: ... \n Github: ... \n> " +
            unicodes.line;
          write();
        }
        break;
      default: {
        try {
          let result = new_win.eval(original_command);
          screen_element.textContent +=
            (typeof result === "object" ? stringify(result) : result) + "\n> ";
        } catch (err) {
          screen_element.textContent += err + "\n> ";
        }
      }
    }
  }
  
  function line_move(keyCode) {
    const line_index = screen_element.textContent.lastIndexOf(">") + 1;
    const line_element = document.getElementById("line");
    let line_text = screen_element.textContent.split(">").at(-1);
    if (!line_text) return;
  
    const pos = line_text.length - line_element.textContent.length;
    if (keyCode === 37 && pos > 1) {
      line_text = line_text.replace(new RegExp(unicodes.line, "gi"), "");
      screen_element.textContent =
        screen_element.textContent.slice(0, line_index) +
        line_text.slice(0, pos - 1);
      line_create(line_text.slice(pos - 1));
    } else if (keyCode === 39 && line_text.length > pos) {
      line_text = line_text.replace(new RegExp(unicodes.line, "gi"), "");
      screen_element.textContent =
        screen_element.textContent.slice(0, line_index) +
        line_text.slice(0, pos + 1);
      line_create(line_text.slice(pos + 1));
    }
  }
  
  function list_control(e) {
    if (
      !finished ||
      !list ||
      !(e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13)
    )
      return;
    const line_index = screen_element.textContent.lastIndexOf(
      "Projects: <<< use arrows and enter"
    );
    let options = screen_element.textContent.slice(line_index).split("\n");
    const current_option = options.findIndex((e) => e.includes(">"));
    options[current_option] = options[current_option].replace("> ", "ㅤ");
    if (e.keyCode === 13) {
      if (current_option === 1)
        alert("You chose project 1")
      else if (current_option === 2)
        alert("You chose project 2")
      else if (current_option === 3)
        alert("You chose project 3")
      else if (current_option === 4) {
        screen_element.textContent += "\n> ";
        line_create();
        list = false;
      }
      return;
    } else if (e.keyCode === 38 && current_option > 1) {
      options[current_option - 1] = options[current_option - 1].replace(
        "ㅤ",
        "> "
      );
    } else if (e.keyCode === 40 && current_option < options.length - 1) {
      options[current_option + 1] = options[current_option + 1].replace(
        "ㅤ",
        "> "
      );
    } else {
      return;
    }
    let result = options.join("\n");
    screen_element.textContent =
      screen_element.textContent.slice(0, line_index) + result;
  }
  
  function stringify(obj) {
    if (obj.constructor.name === "Date") return obj
    if (typeof obj !== "object") return obj;
    const arr = [];
    for (const i in { ...obj }) {
      if (obj[i]) {
        try {
          if (Object.values(obj[i]).find((e) => e === obj[i])) {
            arr.push("Circular " + {}.toString.call(obj[i], {}));
          } else {
            try {
              if (
                obj.constructor.name === "Object" &&
                typeof obj[i] !== "object"
              ) {
                arr.push(`{"${i}": ${obj[i]}}`);
              } else {
                arr.push({}.toString.call(obj[i], {}));
              }
            } catch {}
          }
        } catch {}
      } else {
        arr.push(`${i}: "${obj[i]}"`);
      }
    }
    return [...arr.flat()].join(", ");
  }
  
  function restart() {
    document.getElementById("commands_runner")?.remove();
    commands_runner_create();
    screen_element.textContent = "";
    write();
  }
  