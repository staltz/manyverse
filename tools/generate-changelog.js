const conventionalChangelog = require('conventional-changelog');

const firstReleaseCommit = 'e78c434e0e79201def84bc3d940ba7b953ddaf96';
const mainTemplate = `{{> header}}

{{#if commitGroups.length}}
{{#each commitGroups}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}
{{/each}}
{{else}}
* Minor improvements and bug fixes
{{/if}}

{{> footer}}
`;
const headerPartial = `## {{version}}
`;
const commitPartial = `* {{subject}}
{{~!-- commit link --}} {{#if @root.linkReferences~}}
  ([see details](
  {{~#if @root.repository}}
    {{~#if @root.host}}
      {{~@root.host}}/
    {{~/if}}
    {{~#if @root.owner}}
      {{~@root.owner}}/
    {{~/if}}
    {{~@root.repository}}
  {{~else}}
    {{~@root.repoUrl}}
  {{~/if}}/
  {{~@root.commit}}/{{hash}}))
{{~else}}
  {{~hash}}
{{~/if}}

{{~!-- commit references --}}
{{~#if references~}}
  , closes
  {{~#each references}} {{#if @root.linkReferences~}}
    [
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}#{{this.issue}}](
    {{~#if @root.repository}}
      {{~#if @root.host}}
        {{~@root.host}}/
      {{~/if}}
      {{~#if this.repository}}
        {{~#if this.owner}}
          {{~this.owner}}/
        {{~/if}}
        {{~this.repository}}
      {{~else}}
        {{~#if @root.owner}}
          {{~@root.owner}}/
        {{~/if}}
          {{~@root.repository}}
        {{~/if}}
    {{~else}}
      {{~@root.repoUrl}}
    {{~/if}}/
    {{~@root.issue}}/{{this.issue}})
  {{~else}}
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}#{{this.issue}}
  {{~/if}}{{/each}}
{{~/if}}

`;

module.exports = function generateChangelog(releaseCount) {
  const options = {
    releaseCount,
  };

  const context = {
    host: 'https://gitlab.com',
    owner: 'staltz',
    repository: 'manyverse',
  };

  const gitRawCommitsOpts = {from: firstReleaseCommit};

  const parserOpts = {
    headerPattern: /^(\w*): (.*)$/,
    headerCorrespondence: [`type`, `subject`],
  };

  function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  const writerOpts = {
    groupBy: 'release',
    transform: function(commit, context) {
      if (commit.type === 'ux') {
        commit.subject = capitalize(commit.subject);
        return commit;
      } else {
        return;
      }
    },
    generateOn: (commit, _commits, context) => {
      if (releaseCount > 0 && context.releases >= releaseCount) return false;
      if (commit.type === 'release') {
        context.releases = context.releases || 0;
        context.releases += 1;
        return true;
      }
      return false;
    },
    mainTemplate,
    headerPartial,
    commitPartial,
  };

  return conventionalChangelog(
    options,
    context,
    gitRawCommitsOpts,
    parserOpts,
    writerOpts,
  );
};
