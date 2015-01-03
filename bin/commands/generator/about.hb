<command>

  <details>
    The <class>Generator</class> command provides mechanisms to create various SuperJS classes and methods. By using
    the command you can save yourself time from writing the same glue code over and over. It also helps ensure
    consistency between files, keeping require statements, class comments, definitions, etc in a consistent order and
    style. You can create anything from entire resources to the methods or actions of a controller.
  </details>

  <usages>

    <usage>
      <abstract>
        The following example creates a resource, which includes the controller, model, & other resource objects:
      </abstract>
      <code class="shell">
        > superjs new resource myResource -db waterline
      </code>
    </usage>

    <usage>
      <abstract>
        The following example creates a method in the controller of the resource specified:
      </abstract>
      <code class="shell">
        > superjs new method myResource myMethod
      </code>
    </usage>

  </usages>

</command>