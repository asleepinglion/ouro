<command>
  <details>
    The <class>Launch</class> command starts a server in various modes designed around the lifecycle of development,
    staging, and production. During development and staging the server will watch & restart the code for changes and
    messages are highly verbose. During production, the process manager will make sure the optimal number of worker
    processes are launched, as well as periodicly reswpawn them to fight against memory leaks.

    You also have the option to enable a feature called Snapshots. Snapshots allow you to record requests and responses
    that pass through the api engine. These requests are stored in the <folder>snapshots</folder> folder nested inside
    the resource's folder to which it belongs. These snapshot recordings of the http request and response objects enable
    some pretty cool development tools, such as using them to mock the api for testing and development of the api
    itself, before the actual implementation has been completed.

    Snapshots can be created or manipulated by hand if you want to really get your endpoint developers started, but
    recording them lets you keep them up to date with the latest versions of what your model and controllers
    specifications truly support.
  </details>

  <usages>
    <usage>
      <abstract>
        The following starts a server up in the development mode, which is the default if no mode is specified, and
        tells the server to watch the files and reload on changes. The watch attribute, is actually not necessary here,
        because in the development enviroment, it is enabled by default.

        <note>Note: The <variable>NODE_ENV</variable> environment variable overrides this default.</note>
      </abstract>
      <code>
        > superjs up --watch
      </code>
    </usage>
  </usages>
</command>